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
          position: "relative",
          overflow: "hidden",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", width: 430, height: 430, borderRadius: 999, background: "#F4B400", opacity: 0.18, right: -90, top: -90 }} />
        <div style={{ position: "absolute", width: 260, height: 260, borderRadius: 999, background: "#F4B400", opacity: 0.12, left: 460, bottom: -120 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "58px 68px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F4B400", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontSize: 30, fontWeight: 900 }}>C</div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>Cam<span style={{ color: "#F4B400" }}>Love</span></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
            <div style={{ fontSize: 77, lineHeight: 0.98, fontWeight: 900, letterSpacing: -4 }}>Vse fotografije gostov.</div>
            <div style={{ marginTop: 12, fontSize: 77, lineHeight: 0.98, fontWeight: 900, letterSpacing: -4, color: "#F4B400" }}>En sam album.</div>
            <div style={{ marginTop: 30, fontSize: 27, lineHeight: 1.35, color: "rgba(255,255,255,.68)" }}>QR foto album za poroke, rojstne dneve, zabave in poslovne dogodke. Brez aplikacije.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12 }}>
              {["Fotografije + videi", "Live Photo Wall", "Zasebna galerija"].map((label) => (
                <div key={label} style={{ border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, padding: "10px 17px", fontSize: 18, color: "rgba(255,255,255,.72)" }}>{label}</div>
              ))}
            </div>
            <div style={{ color: "#F4B400", fontSize: 22, fontWeight: 800 }}>camlove.me</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
