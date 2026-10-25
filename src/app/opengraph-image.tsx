import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Sheggar Wheels — Luxury Mobility Architecture Addis Ababa";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #020617 0%, #06281e 50%, #020617 100%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Decorative Glowing Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-40px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.05) 55%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Top Header: Brand Emblem & Insignia Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Logo Brand Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="2.5" />
                <path d="M12 6v6l4 2" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  color: "#ffffff",
                }}
              >
                SHEGGAR WHEELS
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  color: "#34d399",
                }}
              >
                ADDIS ABABA • ETHIOPIA
              </span>
            </div>
          </div>

          {/* Elite Location Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#6ee7b7",
                textTransform: "uppercase",
              }}
            >
              Peer-to-Peer Car Sharing
            </span>
          </div>
        </div>

        {/* Center Editorial Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            maxWidth: "920px",
            zIndex: 10,
            margin: "20px 0",
          }}
        >
          <h1
            style={{
              fontSize: "62px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Drive Excellence.{" "}
            <span
              style={{
                color: "#34d399",
                backgroundImage: "linear-gradient(90deg, #34d399 0%, #2dd4bf 100%)",
                backgroundClip: "text",
              }}
            >
              Experience Extraordinary.
            </span>
          </h1>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            Addis Ababa’s curated mobility network. Rent Suzuki Swift, Hyundai Creta, Toyota Land Cruiser & more directly from authenticated private hosts.
          </p>
        </div>

        {/* Bottom Feature Badges & Trust Guarantees */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981", fontSize: "18px", fontWeight: "bold" }}>✓</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0" }}>
                Bole, Kazanchis & Piassa Hubs
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981", fontSize: "18px", fontWeight: "bold" }}>✓</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0" }}>
                Telebirr & CBE Birr Integrated
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981", fontSize: "18px", fontWeight: "bold" }}>✓</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0" }}>
                Verified Private Hosts
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em" }}>
              shegerwheels.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
