import { useState } from "react";
import { scanCard, analyzeSoil } from "../services/api";
import { C } from "../components/MittiScan/constants";
import { UploadTab } from "../components/MittiScan/UploadTab";
import { DashboardTab } from "../components/MittiScan/DashboardTab";
import { HistoryTab } from "../components/MittiScan/HistoryTab";
import { CartTab } from "../components/MittiScan/CartTab";
import { LoadingOverlay } from "../components/MittiScan/Shared";
import { LandingPage } from "./LandingPage";

/* ── Tab Configuration ── */
const TABS = [
  { id: "upload", label: "Upload", icon: "📤" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "history", label: "History", icon: "📅" },
  { id: "cart", label: "Cart", icon: "🛒" },
];

/* ── Main App ── */
export default function MittiScanApp() {
  const [view, setView] = useState("landing"); // "landing" | "app"
  const [activeTab, setActiveTab] = useState("upload");

  // State
  const [soil, setSoil] = useState({ N: "", P: "", K: "", OC: "", pH: "" });
  const [crop, setCrop] = useState("wheat");
  const [farmSize, setFarmSize] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [file, setFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // Handlers
  async function handleScan(selectedFile) {
    if (!selectedFile) return;
    try {
      setLoading(true);
      setError("");
      const data = await scanCard(selectedFile);
      setSoil(data.soilData);
      setIsVerified(true);
    } catch (err) {
      setError("OCR failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (Object.values(soil).some(val => val === "")) {
      setError("All fields are required");
      return;
    }

    try {
      // UNIT CONVERSION: Acres -> Hectares
      const sizeInHectares = farmSize * 0.4047;
      const response = await analyzeSoil({ soil, crop, farmSize: sizeInHectares });
      setResult(response);

      // Populate cart with recommendations
      const newCart = response.recommendations.map(r => ({
        product: r.product,
        bags: r.bags,
        cost: r.cost,
        unit: "Bag",
        img: "🌾",
        buyLinks: r.buyLinks
      }));
      setCart(newCart);

      setIsVerified(false);
      setActiveTab("dashboard");
    } catch (err) {
      setError("Analysis failed. Please check inputs.");
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload": return <UploadTab
        soil={soil} setSoil={setSoil}
        crop={crop} setCrop={setCrop}
        farmSize={farmSize} setFarmSize={setFarmSize}
        onScan={handleScan} onAnalyze={handleAnalyze}
        loading={loading} error={error}
        isVerified={isVerified} setIsVerified={setIsVerified}
        file={file} setFile={setFile}
        setError={setError}
      />;
      case "dashboard": return <DashboardTab result={result} soil={soil} metrics={result ? true : false} activeTab={activeTab} crop={crop} />;
      case "history": return <HistoryTab />;
      case "cart": return <CartTab cart={cart} setCart={setCart} result={result} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; }

        @keyframes titleShimmer { 0%,100%{filter:drop-shadow(0 0 20px rgba(95,255,138,0.4));} 50%{filter:drop-shadow(0 0 50px rgba(184,255,90,0.6));} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);} }
        @keyframes logoBounce { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-8px) scale(1.04);} }
        @keyframes btnPulse { 0%,100%{box-shadow:0 4px 24px rgba(45,216,112,0.35), 0 0 0 0 rgba(45,216,112,0.2);} 50%{box-shadow:0 8px 40px rgba(45,216,112,0.6), 0 0 0 10px rgba(45,216,112,0);} }
        @keyframes shimmerSlide { 0%,65%,100%{transform:translateX(-100%);} 35%{transform:translateX(100%);} }
        @keyframes tabSlide { from{opacity:0; transform:translateY(-10px);} to{opacity:1; transform:translateY(0);} }
        @keyframes contentFadeIn { from{opacity:0; transform:scale(0.96);} to{opacity:1; transform:scale(1);} }

        /* Organic Animations */
        @keyframes sway { 0%{transform:rotate(0deg);} 100%{transform:rotate(2deg);} }
        @keyframes drift { 0%{transform:translate(0,0);} 50%{transform:translate(10px,-10px);} 100%{transform:translate(0,0);} }
        @keyframes pulse-soft { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
        @keyframes leafFloat { 0%{ transform: translate(0,0) rotate(0deg); opacity:0; } 20%{ opacity:1; } 100%{ transform: translate(var(--drift), 100vh) rotate(360deg); opacity:0; } }
        @keyframes orbPulse { 0%,100%{ transform: translate(-50%,-50%) scale(1); opacity:0.3; } 50%{ transform: translate(-50%,-50%) scale(1.1); opacity:0.6; } }
        @keyframes grassSway { 0%{ transform: rotate(-2deg); } 100%{ transform: rotate(2deg); } }
        
        .grass-layer {
          position: absolute; bottom: -20px; left: 0; right: 0; height: 120px;
          background: url('data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"%3E%3Cpath fill="%232dd870" fill-opacity="0.2" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"%3E%3C/path%3E%3C/svg%3E');
          background-size: cover;
          animation: sway 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .floating-orb {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(95,255,138,0.2) 0%, rgba(255,255,255,0) 70%);
          animation: drift 10s ease-in-out infinite;
        }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 100% !important; }
          .top-box { flex-direction: column !important; gap: 24px !important; }
          .desktop-divider { display: none !important; }
          .metric-group { justify-content: space-around !important; width: 100% !important; }
          .gauge-flex { gap: 12px !important; }
        }
      `}</style>

      {/* GLOBAL LOADING OVERLAY */}
      {loading && <LoadingOverlay message={isVerified ? "Analyzing Soil..." : "Scanning Card..."} />}

      {view === "landing" ? (
        <LandingPage onEnterApp={() => setView("app")} />
      ) : (
        /* ── App Screen ── */
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          background: "linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)",
          display: "flex", flexDirection: "column",
          padding: "clamp(20px,3vw,40px)",
          overflow: "auto",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 24, flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.leafDeep, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
                Mitti-Scan
              </div>
            </div>

            <button
              onClick={() => setView("landing")}
              style={{
                padding: "8px 20px", borderRadius: 100,
                background: C.whiteOverlay,
                border: "1px solid rgba(45,216,112,0.3)",
                color: C.leafDeep, fontSize: 12, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >← Back</button>
          </div>

          {/* Organic Tab Navigation */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 32,
            background: C.whiteOverlay,
            padding: 6, borderRadius: 100,
            border: "1px solid rgba(45,216,112,0.25)",
            alignSelf: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}>
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 28px", borderRadius: 100,
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg,#1a7a30,#2dd870)"
                    : "transparent",
                  border: "none",
                  color: activeTab === tab.id ? "#fff" : C.leafDeep,
                  fontSize: 13, fontWeight: 700, letterSpacing: 1,
                  cursor: "pointer", transition: "all 0.3s",
                  textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingBottom: 40,
            animationName: "contentFadeIn",
            animationDuration: "0.4s",
          }}>
            {renderTabContent()}
          </div>
        </div>
      )}
    </>
  );
}
