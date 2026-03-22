import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D1B1E",
          position: "relative",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#2ECC87",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 400,
              color: "white",
              fontFamily: "serif",
            }}
          >
            mi
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 400,
              color: "#2ECC87",
              fontFamily: "serif",
            }}
          >
            propina
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            textAlign: "center",
          }}
        >
          Propinas digitales para restaurantes
        </p>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
          }}
        >
          {["QR en cada mesa", "Pago seguro", "Reparto justo"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#2ECC87",
                }}
              />
              <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)" }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.3)",
            margin: 0,
          }}
        >
          mipropina.es
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
