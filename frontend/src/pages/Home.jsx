import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "white",
      textAlign: "center",
      pointerEvents: "auto"
    }}>
      <h1 style={{ fontSize: 48, fontFamily: "Playfair Display" }}>
        Mitti-Scan
      </h1>

      <p style={{ letterSpacing: 4, marginTop: 10 }}>
        Soil Health Card Digitizer + Actionizer
      </p>

      <button
        style={{ marginTop: 30 }}
        onClick={() => navigate("/scan")}
      >
        Scan Your Soil Card
      </button>
    </div>
  );
}
