"use client";

import { useEffect } from "react";

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

function makeNativeVideo(src: string, fallbackIframeSrc?: string): HTMLVideoElement {
  const video = document.createElement("video");
  video.src = src;
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.dataset.bunnyPlaybackChecked = "1";
  video.style.display = "block";
  video.style.width = "100%";
  video.style.aspectRatio = "16 / 9";
  video.style.objectFit = "contain";
  video.style.background = "#000";

  // Some Bunny videos were uploaded before MP4 fallback was fully available.
  // If the same-origin MP4 proxy fails for one of those, restore the original
  // Bunny iframe rather than leaving a broken/black native player.
  if (fallbackIframeSrc) {
    video.addEventListener("error", () => {
      if (!video.isConnected) return;
      const iframe = document.createElement("iframe");
      iframe.src = fallbackIframeSrc;
      iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.setAttribute("frameborder", "0");
      iframe.dataset.bunnyPlaybackChecked = "1";
      iframe.style.display = "block";
      iframe.style.width = "100%";
      iframe.style.aspectRatio = "16 / 9";
      iframe.style.border = "0";
      iframe.style.background = "#000";
      video.replaceWith(iframe);
    }, { once: true });
  }

  return video;
}

/**
 * Normalise Bunny Stream playback in public galleries.
 *
 * Existing and newly uploaded Bunny Stream videos prefer Guestcam's
 * same-origin Range-aware MP4 proxy on every browser. Password-protected
 * albums are authorized by the HttpOnly album-access cookie; no album
 * password is copied into fetch URLs or browser history.
 */
export function IosBunnyPlaybackFix() {
  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length !== 1) return;

    const slug = decodeURIComponent(pathParts[0]);

    const upgradeElement = async (element: HTMLIFrameElement | HTMLVideoElement) => {
      if (element.dataset.bunnyPlaybackChecked === "1") return;

      const src = element.getAttribute("src") ?? "";

      // Server-rendered signed Guestcam proxy videos are already on the desired
      // playback path. Mark them and leave them alone.
      if (element instanceof HTMLVideoElement && src.includes("/video-download?") && src.includes("play=1")) {
        element.dataset.bunnyPlaybackChecked = "1";
        return;
      }

      const vid = bunnyVideoIdFromUrl(src);
      if (!vid) return;
      element.dataset.bunnyPlaybackChecked = "1";

      try {
        const qs = new URLSearchParams({ vid });
        const response = await fetch(
          `/api/albums/${encodeURIComponent(slug)}/video-playback-url?${qs.toString()}`,
          { cache: "no-store", credentials: "same-origin" },
        );

        if (!response.ok) {
          console.warn("[video-playback] signed URL request failed", response.status);
          return;
        }

        const data = (await response.json()) as { url?: string };
        if (!data.url || !element.isConnected) return;

        if (element instanceof HTMLIFrameElement) {
          const fallback = src;
          element.replaceWith(makeNativeVideo(data.url, fallback));
          return;
        }

        // Direct Bunny HLS/MP4 rendered by older Safari-specific server logic:
        // prefer the same-origin proxy but keep the direct source as a fallback.
        const fallbackSrc = src;
        element.src = data.url;
        element.controls = true;
        element.playsInline = true;
        element.preload = "metadata";
        element.dataset.bunnyPlaybackChecked = "1";
        element.addEventListener("error", () => {
          if (!element.isConnected || element.src === fallbackSrc) return;
          element.src = fallbackSrc;
          element.load();
        }, { once: true });
        element.load();
      } catch (error) {
        console.warn("[video-playback] failed to switch to Guestcam proxy", error);
      }
    };

    const scan = (root: ParentNode = document) => {
      root
        .querySelectorAll<HTMLIFrameElement | HTMLVideoElement>(
          'iframe[src*="mediadelivery.net/embed/"], video[src*="playlist.m3u8"], video[src*="/play_"], video[src*="/video-download?"]',
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
