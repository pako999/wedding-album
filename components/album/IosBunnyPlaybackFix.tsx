"use client";

import { useEffect } from "react";

function isIosDevice(): boolean {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  if (/iPhone|iPad|iPod/i.test(ua)) return true;

  // iPadOS can identify as Macintosh when requesting a desktop site.
  return /Mac/i.test(platform + " " + ua) && navigator.maxTouchPoints > 1;
}

function bunnyVideoIdFromUrl(src: string): string | null {
  try {
    const url = new URL(src, window.location.href);

    // Bunny iframe/player URL: /embed/{libraryId}/{videoId}
    const embedMatch = url.pathname.match(/\/embed\/[^/]+\/([a-z0-9-]+)/i);
    if (embedMatch?.[1]) return embedMatch[1];

    // Guestcam playback proxy: ?vid={videoId}
    const queryVid = url.searchParams.get("vid");
    if (queryVid) return queryVid;

    // Bunny HLS / MP4 paths: /{videoId}/playlist.m3u8 or /{videoId}/play_720p.mp4
    const mediaMatch = url.pathname.match(/\/([a-f0-9-]{20,})\/(?:playlist\.m3u8|play_[^/]+\.mp4)$/i);
    return mediaMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

export function IosBunnyPlaybackFix() {
  useEffect(() => {
    if (!isIosDevice()) return;

    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length !== 1) return;

    const slug = decodeURIComponent(pathParts[0]);
    const albumPassword = new URLSearchParams(window.location.search).get("pw") ?? "";

    const upgradeElement = async (element: HTMLIFrameElement | HTMLVideoElement) => {
      if (element.dataset.iosPlaybackChecked === "1") return;

      const src = element.getAttribute("src") ?? "";
      const vid = bunnyVideoIdFromUrl(src);
      if (!vid) return;

      element.dataset.iosPlaybackChecked = "1";

      try {
        const qs = new URLSearchParams({ vid });
        if (albumPassword) qs.set("pw", albumPassword);

        const response = await fetch(
          `/api/albums/${encodeURIComponent(slug)}/video-playback-url?${qs.toString()}`,
          { cache: "no-store", credentials: "same-origin" },
        );

        if (!response.ok) {
          console.warn("[ios-video] Bunny Player 2 URL request failed", response.status);
          return;
        }

        const data = (await response.json()) as { url?: string };
        if (!data.url || !element.isConnected) return;

        if (element instanceof HTMLIFrameElement) {
          element.src = data.url;
          element.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture";
          element.allowFullscreen = true;
          return;
        }

        // Server-side Safari fallbacks from earlier versions may already have
        // rendered a native <video>. On iOS replace that with Bunny Player 2
        // so the browser uses Bunny's officially supported iOS playback path.
        const iframe = document.createElement("iframe");
        iframe.src = data.url;
        iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.setAttribute("frameborder", "0");
        iframe.style.display = "block";
        iframe.style.width = "100%";
        iframe.style.aspectRatio = "16 / 9";
        iframe.style.border = "0";
        iframe.style.background = "#000";

        element.replaceWith(iframe);
      } catch (error) {
        console.warn("[ios-video] failed to switch to Bunny Player 2", error);
      }
    };

    const scan = (root: ParentNode = document) => {
      root
        .querySelectorAll<HTMLIFrameElement | HTMLVideoElement>(
          'iframe[src*="mediadelivery.net/embed/"], video[src*="/video-download?"], video[src*="playlist.m3u8"], video[src*="/play_"]',
        )
        .forEach((element) => { void upgradeElement(element); });
    };

    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          if (node instanceof HTMLIFrameElement || node instanceof HTMLVideoElement) {
            void upgradeElement(node);
          } else {
            scan(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
