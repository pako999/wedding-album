import { ImageResponse } from "next/og";

export const alt = "CamLove — vse fotografije gostov v enem QR albumu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#111111",
          color: "#ffffff",
          padding: "58px 68px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#F4B400", display: "flex", alignItems: "center", justifyContent: "center", color: "#111111", fontSize: 30, fontWeight: 900 }}>C</div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>
            <span>Cam</span><span style={{ color: "#F4B400" }}>Love</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1, fontWeight: 900, letterSpacing: -4 }}>Vse fotografije gostov.</div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 76, lineHeight: 1, fontWeight: 900, letterSpacing: -4, color: "#F4B400" }}>En sam album.</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 27, lineHeight: 1.35, color: "rgba(255,255,255,.68)" }}>QR foto album za poroke, rojstne dneve, zabave in poslovne dogodke. Brez aplikacije.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,.62)" }}>Fotografije + videi · Live Photo Wall · Zasebna galerija</div>
          <div style={{ display: "flex", color: "#F4B400", fontSize: 22, fontWeight: 800 }}>camlove.me</div>
        </div>
      </div>
    ),
    size,
  );
}
