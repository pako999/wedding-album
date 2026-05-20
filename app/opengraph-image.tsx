import { ImageResponse } from "next/og";

// Branded social-share preview image, used for Open Graph and Twitter
// across the whole site (any page without its own opengraph-image).
export const alt = "Guestcam — zberite fotografije gostov z eno QR kodo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0F1729",
          padding: "0 90px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#FFC94D", fontWeight: 700 }}>
          GUESTCAM
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.12,
            marginTop: 26,
            maxWidth: 1000,
          }}
        >
          Zberite fotografije gostov z eno QR kodo
        </div>
        <div style={{ display: "flex", fontSize: 31, color: "#FFF3CC", marginTop: 30 }}>
          Brez aplikacije · Polna kakovost · Zasebna galerija
        </div>
      </div>
    ),
    { ...size },
  );
}
