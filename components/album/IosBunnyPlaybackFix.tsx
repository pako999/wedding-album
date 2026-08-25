"use client";

import { useEffect } from "react";

function isIosDevice(): boolean {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  if (/iPhone|iPad|iPod/i.test(ua)) return true;

  // iPadOS (and iOS Safari when "Request Desktop Website" is active) can
  // identify as Macintosh. Real Macs report maxTouchPoints=0, iOS/iPadOS > 1.
  return /Mac/i.test(platform + " " + ua) && navigator.maxTouchPoints > 1;
}

function bunnyVideoId(src: string): string | null {
  try {
    const url = new URL(src, window.location.href);
    if (!/mediadelivery\.net$/i.test(url.hostname)) return null;
    const match = url.pathname.match(/\/embed\/[^/]+\/([a-z0-9-]+)/i);
    return match?.[1] ?? null;
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

    const upgradeIframe = async (iframe: HTMLIFrameElement) => {
      if (iframe.dataset.iosPlaybackChecked === "1") return;

      const src = iframe.getAttribute("src") ?? "";
      const vid = bunnyVideoId(src);
      if (!vid) return;

      iframe.dataset.iosPlaybackChecked = "1";

      try {
        const qs = new URLSearchParams({ vid });
        if (albumPassword) qs.set("pw", albumPassword);

        const response = await fetch(
          `/api/albums/${encodeURIComponent(slug)}/video-playback-url?${qs.toString()}`,
          { cache: "no-store", credentials: "same-origin" },
        );
        if (!response.ok) {
          console.warn("[ios-video] playback URL request failed", response.status);
          return;
        }

        const data = (await response.json()) as { url?: string };
        if (!data.url || !iframe.isConnected) return;

        const video = document.createElement("video");
        video.src = data.url;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.style.position = "absolute";
        video.style.inset = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
        video.style.background = "#000";

        iframe.replaceWith(video);
        video.load();
      } catch (error) {
        console.warn("[ios-video] failed to switch Bunny iframe", error);
      }
    };

    const scan = (root: ParentNode = document) => {
      root
        .querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="player.mediadelivery.net/embed/"], iframe[src*="iframe.mediadelivery.net/embed/"]',
        )
        .forEach((iframe) => { void upgradeIframe(iframe); });
    };

    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.tagName === "IFRAME") {
            void upgradeIframe(node as HTMLIFrameElement);
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
