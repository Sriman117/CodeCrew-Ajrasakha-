import { useState, useEffect, useRef, useCallback } from "react";
import { scanCard, analyzeSoil } from "../services/api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

/* ── Palette ── */
const C = {
  leafDeep: "#0a2e12",
  forestMid: "#0f4a1e",
  grassBright: "#1a7a30",
  mintFresh: "#2dd870",
  neonGreen: "#5fff8a",
  limeGlow: "#b8ff5a",
  creamWhite: "#f0ffe8",
  dewBlue: "#c8fff0",
  goldSun: "#f5d060",
  soilRich: "#5c3a1e",
  whiteOverlay: "rgba(255,255,255,0.85)",
};

/* ── Static data ── */
const STARS = Array.from({ length: 160 }, () => ({
  x: Math.random(), y: Math.random(),
  r: 0.4 + Math.random() * 1.8,
  sp: 0.0008 + Math.random() * 0.003,
  ph: Math.random() * Math.PI * 2,
  col: Math.random() > 0.6 ? "#5fff8a" : Math.random() > 0.5 ? "#b8ff5a" : "#c8fff0",
}));

const LEAVES = Array.from({ length: 22 }, (_, i) => ({
  x: Math.random() * 100, y: Math.random() * 100,
  size: 18 + Math.random() * 40, rot: Math.random() * 360,
  dur: 6 + Math.random() * 12, delay: Math.random() * -12,
  drift: (Math.random() - 0.5) * 160, opacity: 0.06 + Math.random() * 0.12,
  type: Math.floor(Math.random() * 3),
}));

const ORBS = Array.from({ length: 6 }, (_, i) => ({
  x: 10 + Math.random() * 80, y: 10 + Math.random() * 80,
  size: 80 + Math.random() * 180, dur: 8 + Math.random() * 12, delay: Math.random() * -10,
  col: [C.mintFresh, C.neonGreen, C.limeGlow, C.dewBlue, "#a8ffcc", "#d4ffb0"][i],
}));

const GRASS = Array.from({ length: 80 }, (_, i) => {
  const x = (i / 79) * 1440 + (Math.random() - 0.5) * 15;
  const h = 40 + Math.random() * 90;
  return {
    x, h, qx: x + (Math.random() - 0.5) * 18,
    col: ["#2dd870", "#5fff8a", "#1a7a30", "#b8ff5a"][Math.floor(Math.random() * 4)],
    sw: 0.8 + Math.random() * 1.8, op: 0.35 + Math.random() * 0.5,
    dur: 1.5 + Math.random() * 2.5, delay: Math.random() * 3,
    grainCol: Math.random() > 0.5 ? "#f5d060" : "#b8ff5a",
    grainRx: 1.5 + Math.random() * 2.5, grainRy: 5 + Math.random() * 8,
    grainOp: 0.5 + Math.random() * 0.4,
  };
});

/* ── Canvas ── */
function FieldCanvas() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const t = tRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#dfffee");
      sky.addColorStop(0.3, "#c2ffda");
      sky.addColorStop(0.6, "#e8fff4");
      sky.addColorStop(1, "#f5fff0");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.015;
        const grad = ctx.createLinearGradient(w / 2, -50, w / 2 + Math.cos(angle) * w, Math.sin(angle) * h);
        grad.addColorStop(0, `rgba(255,255,220,${0.06 + 0.04 * Math.sin(t * 0.3 + i)})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        const perp = angle + Math.PI / 2;
        ctx.moveTo(w / 2 + Math.cos(perp) * 20, -50 + Math.sin(perp) * 20);
        ctx.lineTo(w / 2 + Math.cos(angle) * w * 1.2 + Math.cos(perp) * 60, Math.sin(angle) * h * 1.2 + Math.sin(perp) * 60);
        ctx.lineTo(w / 2 + Math.cos(angle) * w * 1.2 - Math.cos(perp) * 60, Math.sin(angle) * h * 1.2 - Math.sin(perp) * 60);
        ctx.lineTo(w / 2 - Math.cos(perp) * 20, -50 - Math.sin(perp) * 20);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      const hills = [
        { y: 0.70, amp: 30, freq: 0.0015, sp: 0.25, col: "rgba(26,122,48,0.18)" },
        { y: 0.75, amp: 20, freq: 0.002, sp: 0.35, col: "rgba(20,100,38,0.22)" },
        { y: 0.80, amp: 14, freq: 0.003, sp: 0.5, col: "rgba(15,74,30,0.28)" },
        { y: 0.86, amp: 8, freq: 0.004, sp: 0.7, col: "rgba(10,55,20,0.38)" },
        { y: 0.92, amp: 5, freq: 0.005, sp: 0.9, col: "rgba(92,58,30,0.55)" },
      ];
      hills.forEach(s => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y = h * s.y + Math.sin(x * s.freq + t * s.sp) * s.amp + Math.sin(x * s.freq * 2.1 + t * s.sp * 1.4) * s.amp * 0.35;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = s.col; ctx.fill();
      });

      const sunX = w * 0.82, sunY = h * 0.12;
      const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 160);
      sun.addColorStop(0, "rgba(255,240,140,0.55)");
      sun.addColorStop(0.3, "rgba(245,210,60,0.25)");
      sun.addColorStop(0.7, "rgba(180,255,130,0.1)");
      sun.addColorStop(1, "transparent");
      ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.4);
      glow.addColorStop(0, "rgba(95,255,138,0.07)");
      glow.addColorStop(0.5, "rgba(45,216,112,0.04)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

      STARS.forEach(s => {
        const alpha = 0.15 + 0.4 * Math.abs(Math.sin(t * s.sp * 40 + s.ph));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h * 0.75, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.col;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.strokeStyle = "rgba(45,216,112,0.04)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(t * 0.5 + y * 0.01) * 2);
        ctx.lineTo(w, y + Math.sin(t * 0.5 + y * 0.01) * 2);
        ctx.stroke();
      }

      tRef.current += 0.007;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

/* ── Decorative layers ── */
function LeafShape({ type, size, color = C.mintFresh }) {
  if (type === 0) return <ellipse cx={size / 2} cy={size / 2} rx={size * 0.25} ry={size * 0.45} fill={color} opacity="0.9" transform={`rotate(-20 ${size / 2} ${size / 2})`} />;
  if (type === 1) return <path d={`M${size / 2},${size * 0.1} C${size * 0.8},${size * 0.2} ${size * 0.9},${size * 0.6} ${size / 2},${size * 0.9} C${size * 0.1},${size * 0.6} ${size * 0.2},${size * 0.2} ${size / 2},${size * 0.1}Z`} fill={color} opacity="0.9" />;
  return <path d={`M${size / 2},${size * 0.08} L${size * 0.75},${size * 0.35} L${size * 0.65},${size * 0.92} L${size * 0.35},${size * 0.92} L${size * 0.25},${size * 0.35}Z`} fill={color} opacity="0.9" />;
}

function LeafParticles() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {LEAVES.map((l, i) => (
        <div key={i} style={{
          position: "absolute", left: `${l.x}%`, top: `${l.y}%`,
          width: l.size, height: l.size, opacity: l.opacity,
          animationName: "leafFloat", animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`,
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          "--drift": `${l.drift}px`, transform: `rotate(${l.rot}deg)`,
        }}>
          <svg viewBox={`0 0 ${l.size} ${l.size}`} width={l.size} height={l.size}>
            <LeafShape type={l.type} size={l.size} color={i % 3 === 0 ? C.mintFresh : i % 3 === 1 ? C.limeGlow : C.neonGreen} />
          </svg>
        </div>
      ))}
    </div>
  );
}

function GlowOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      {ORBS.map((o, i) => (
        <div key={i} style={{
          position: "absolute", left: `${o.x}%`, top: `${o.y}%`, width: o.size, height: o.size,
          borderRadius: "50%", transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${o.col}22 0%, ${o.col}08 40%, transparent 70%)`,
          animationName: "orbPulse", animationDuration: `${o.dur}s`, animationDelay: `${o.delay}s`,
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          filter: `blur(${20 + i * 4}px)`,
        }} />
      ))}
    </div>
  );
}

function GrassLayer() {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 220, zIndex: 1, pointerEvents: "none" }}>
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a7a30" stopOpacity="0" />
            <stop offset="50%" stopColor="#0a2e12" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#050f06" stopOpacity="1" />
          </linearGradient>
        </defs>
        <ellipse cx="720" cy="220" rx="950" ry="90" fill="#0f4a1e" opacity="0.7" />
        <rect x="0" y="175" width="1440" height="45" fill="url(#groundGrad)" />
        {GRASS.map((g, i) => (
          <g key={i}>
            <path d={`M${g.x},210 Q${g.qx},${210 - g.h / 2} ${g.x},${210 - g.h}`}
              stroke={g.col} strokeWidth={g.sw} fill="none" opacity={g.op}
              style={{
                transformOrigin: `${g.x}px 210px`, animationName: "grassSway", animationDuration: `${g.dur}s`,
                animationDelay: `${g.delay}s`, animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite", animationDirection: "alternate"
              }}
            />
            <ellipse cx={g.x} cy={210 - g.h} rx={g.grainRx} ry={g.grainRy} fill={g.grainCol} opacity={g.grainOp}
              style={{
                transformOrigin: `${g.x}px ${210 - g.h}px`, animationName: "grassSway", animationDuration: `${g.dur}s`,
                animationDelay: `${g.delay}s`, animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite", animationDirection: "alternate"
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Hardcoded Standards (Mirroring Backend) ── */
// In a real app, fetch this from API or shared config
const CROP_STANDARDS = {
  wheat: { targetN: 300, targetP: 40, targetK: 300 },
  rice: { targetN: 250, targetP: 30, targetK: 250 },
  cotton: { targetN: 275, targetP: 35, targetK: 275 },
};

/* ─────────────────────────────────────────
   TAB SYSTEM + CONTENT
───────────────────────────────────────── */

const TABS = [
  { id: "upload", label: "Upload", icon: "📤" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "history", label: "History", icon: "📅" },
  { id: "cart", label: "Cart", icon: "🛒" },
];

/* ── UI Components ── */
const Skeleton = ({ width, height, style }) => (
  <div style={{
    width, height, background: "rgba(0,0,0,0.06)", borderRadius: 8,
    animation: "pulse 1.5s infinite ease-in-out", ...style
  }} />
);

const LoadingOverlay = ({ message }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(5px)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
  }}>
    <div style={{
      width: 50, height: 50, border: `5px solid ${C.mintFresh}`,
      borderTopColor: "transparent", borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <div style={{ marginTop: 20, fontSize: 18, fontWeight: 700, color: C.leafDeep, letterSpacing: 1 }}>
      {message || "Processing..."}
    </div>
    <div style={{ marginTop: 8, fontSize: 13, color: C.forestMid, opacity: 0.8 }}>
      Please wait, our AI is working accurately
    </div>
    <style>{`
      @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
    `}</style>
  </div>
);

const ErrorBanner = ({ message, onClose }) => (
  <div style={{
    background: "#ffe5e5", border: "1px solid #ff6b6b", borderRadius: 12,
    padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
    color: "#c0392b", justifyContent: "space-between"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <span style={{ fontWeight: 600 }}>{message}</span>
    </div>
    {onClose && (
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#c0392b" }}>×</button>
    )}
  </div>
);

/* ── Upload / Verify Tab ── */
function UploadTab({ soil, setSoil, crop, setCrop, farmSize, setFarmSize, onScan, onAnalyze, loading, error, isVerified, setIsVerified, file, setFile, setError }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = e => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = e => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragOut = e => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = e => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };
  const handleChange = e => { if (e.target.files?.[0]) setFile(e.target.files[0]); };

  if (isVerified) {
    return (
      <div style={{ width: "100%", maxWidth: 600 }}>
        <div style={{
          fontSize: 28, fontWeight: 800, color: C.leafDeep,
          fontFamily: "'Playfair Display',serif", marginBottom: 20, textAlign: "center"
        }}>Verify & Edit Results</div>

        <div style={{ background: C.whiteOverlay, padding: 24, borderRadius: 20, backdropFilter: "blur(12px)", border: `1px solid ${C.mintFresh}44` }}>
          {Object.keys(soil).map(key => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.leafDeep, marginBottom: 4, textTransform: "uppercase" }}>{key}</label>
              <input
                type="number"
                value={soil[key]}
                onChange={(e) => setSoil({ ...soil, [key]: Number(e.target.value) || "" })}
                style={{
                  width: "100%", padding: "12px", borderRadius: 8, border: "1px solid rgba(45,216,112,0.3)",
                  background: "rgba(255,255,255,0.9)", fontSize: 16, color: C.leafDeep, outline: "none"
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.leafDeep, marginBottom: 4, textTransform: "uppercase" }}>Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: 8, border: "1px solid rgba(45,216,112,0.3)",
                background: "rgba(255,255,255,0.9)", fontSize: 16, color: C.leafDeep, outline: "none"
              }}
            >
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
              <option value="cotton">Cotton</option>
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.leafDeep, marginBottom: 4, textTransform: "uppercase" }}>Farm Size (Acres)</label>
            <input
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(Number(e.target.value))}
              min="1"
              style={{
                width: "100%", padding: "12px", borderRadius: 8, border: "1px solid rgba(45,216,112,0.3)",
                background: "rgba(255,255,255,0.9)", fontSize: 16, color: C.leafDeep, outline: "none"
              }}
            />
          </div>

          <button
            onClick={onAnalyze}
            style={{
              width: "100%", padding: "14px", borderRadius: 100,
              background: "linear-gradient(135deg,#1a7a30,#2dd870)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 6px 28px rgba(45,216,112,0.4)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Generated Analysis Report
          </button>
          {error && <p style={{ color: "red", marginTop: 12, textAlign: "center", fontWeight: 700 }}>{error}</p>}
        </div>
        <button onClick={() => setIsVerified(false)} style={{ marginTop: 16, background: "none", border: "none", color: C.leafDeep, cursor: "pointer", textDecoration: "underline" }}>Cancel & Re-upload</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{
        fontSize: 28, fontWeight: 800, color: C.leafDeep,
        fontFamily: "'Playfair Display',serif", marginBottom: 4,
      }}>Upload Soil Health Card</div>
      <p style={{ fontSize: 14, color: C.forestMid, maxWidth: 500, textAlign: "center", lineHeight: 1.6, opacity: 0.8 }}>
        Upload a photo or scan of your Soil Health Card. Our AI-powered OCR will extract all the nutrients, pH levels, and recommendations.
      </p>

      <div
        onDragEnter={handleDragIn} onDragLeave={handleDragOut}
        onDragOver={handleDrag} onDrop={handleDrop}
        style={{
          width: "100%", maxWidth: 600, height: 320, borderRadius: 20,
          border: dragActive ? "3px dashed #2dd870" : `2px dashed ${C.mintFresh}66`,
          background: dragActive ? "rgba(45,216,112,0.08)" : C.whiteOverlay,
          backdropFilter: "blur(12px)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: dragActive ? "0 8px 40px rgba(45,216,112,0.25)" : "0 4px 24px rgba(0,0,0,0.06)",
        }}
        onClick={() => document.getElementById("file-input").click()}
      >
        {!file ? (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,#2dd870,#5fff8a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, boxShadow: "0 8px 24px rgba(45,216,112,0.3)",
            }}>📄</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.leafDeep }}>
              Drop your card here or click to browse
            </div>
            <div style={{ fontSize: 13, color: C.forestMid, opacity: 0.7 }}>
              Supports JPG, PNG, PDF up to 10MB
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,#2dd870,#5fff8a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.leafDeep }}>{file.name}</div>
            <div style={{ fontSize: 13, color: "#0a4a1e66" }}>{(file.size / 1024).toFixed(0)} KB</div>
            <button style={{
              marginTop: 8, padding: "10px 28px", borderRadius: 100,
              background: "linear-gradient(135deg,#1a7a30,#2dd870)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(45,216,112,0.4)",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              onClick={e => { e.stopPropagation(); onScan(file); }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Process Card"}
            </button>
          </>
        )}
      </div>

      <input id="file-input" type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleChange} />
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div style={{ marginTop: 12, display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {["Fast OCR", "98% Accuracy", "Instant Results"].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: C.neonGreen,
              boxShadow: "0 0 8px rgba(95,255,138,0.6)",
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.leafDeep }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Tab ── */
function DashboardTab({ result, soil, metrics, activeTab, crop }) {
  const [analytics, setAnalytics] = useState({ totalScans: 0, totalDeficiencies: 0, totalCost: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fetch community impact metrics
    fetch('http://localhost:5000/api/analytics/metrics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error("Failed to fetch metrics", err));
  }, []);

  if (!result || !metrics || !soil) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🧬</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.leafDeep }}>No Analysis Data Yet</div>
        <p style={{ color: "#0a4a1e88" }}>Please upload and process a soil health card first.</p>
      </div>
    )
  }

  // Helper Gauge Component
  const RadialGauge = ({ label, value, min, max, ideal }) => {
    // Normalize value to percentage (0-100)
    const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    // Determine Color based on proximity to Ideal
    let color = "#ff6b6b"; // Red (Bad)
    if (value >= ideal * 0.9 && value <= ideal * 1.1) color = C.mintFresh; // Green (Good)
    else if (value >= ideal * 0.75 && value <= ideal * 1.25) color = "#f5d060"; // Yellow (Okay)

    const data = [
      { name: 'Value', value: percent, fill: color },
      { name: 'Rest', value: 100 - percent, fill: '#eee' },
    ];

    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        width: isMobile ? "45%" : "30%", minWidth: 100, // Responsive Width
        marginBottom: isMobile ? 16 : 0
      }}>
        <div style={{ height: 100, width: "100%", position: "relative" }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={color} />
                <Cell key="cell-1" fill="#706f6fff" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            textAlign: "center", fontSize: 20, fontWeight: 800, color: C.leafDeep
          }}>
            {value}
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: C.leafDeep, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 10, color: "#0a4a1e88" }}>Target: {ideal}</div>
      </div>
    );
  };

  const standards = CROP_STANDARDS[crop] || CROP_STANDARDS['wheat'];
  const barData = [
    { name: "Nitrogen", value: soil.N, ideal: standards.targetN },
    { name: "Phosphorus", value: soil.P, ideal: standards.targetP },
    { name: "Potassium", value: soil.K, ideal: standards.targetK },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 1200 }}>

      {/* 1. TOP BOX: Extracted Values + Impact Metrics */}
      <div className="top-box" style={{
        background: C.whiteOverlay, padding: 24, borderRadius: 20,
        border: `1px solid ${C.mintFresh}44`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row" // FORCE COLUMN ON MOBILE
      }}>
        {/* Extracted Values Group */}
        <div style={{ flex: "1 1 300px", width: "100%" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.forestMid, textTransform: "uppercase", marginBottom: 16, letterSpacing: 1 }}>
            Extracted Soil Values
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "space-between" }}>
            {[
              { l: "Nitrogen", v: soil.N, u: "mg/kg" },
              { l: "Phosphorus", v: soil.P, u: "mg/kg" },
              { l: "Potassium", v: soil.K, u: "mg/kg" },
              { l: "pH Level", v: soil.pH, u: "" },
              { l: "Org. Carbon", v: soil.OC, u: "%" }
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.6)", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)",
                flex: "1 1 100px", display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <div style={{ fontSize: 10, color: "#0a4a1e88", fontWeight: 700, textTransform: "uppercase" }}>{item.l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.leafDeep }}>{item.v}<span style={{ fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{item.u}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator for desktop */}
        {!isMobile && <div style={{ width: 1, backgroundColor: C.mintFresh, opacity: 0.3, alignSelf: "stretch" }} className="desktop-divider" />}

        {/* Impact Metrics Group */}
        <div className="metric-group" style={{ flex: "1 1 250px", display: "flex", justifyContent: isMobile ? "space-around" : "flex-end", gap: 16, flexWrap: "wrap", width: "100%" }}>
          {[
            { label: "Community Scans", val: analytics.totalScans || "-", icon: "🌍" },
            { label: "Deficiencies", val: analytics.totalDeficiencies || "-", icon: "🔍" },
            { label: "Est. Savings", val: "₹" + (analytics.totalCost ? (analytics.totalCost * 0.15).toFixed(0) : "-"), icon: "💰" }
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 24 }}>{m.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.leafDeep }}>{m.val}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", color: "#0a4a1e88", fontWeight: 700 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>


      {/* 2. MIDDLE SECTION: Two Cols (Gauges + Bar Chart) */}
      <div className="dashboard-grid" style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))", // FORCE 1 COLUMN
        gap: 24, marginBottom: 24
      }}>

        {/* LEFT BOX: Radial Speedometers */}
        <div style={{
          background: C.whiteOverlay, padding: 24, borderRadius: 20,
          border: `1px solid ${C.mintFresh}44`, display: "flex", flexDirection: "column"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.leafDeep, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🚀</span> Nutrient Health Gauges
          </div>
          <div className="gauge-flex" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, flex: 1, alignItems: "center" }}>
            <RadialGauge label="Nitrogen" value={soil.N || 0} min={0} max={600} ideal={standards.targetN} />
            <RadialGauge label="Phosphorus" value={soil.P || 0} min={0} max={100} ideal={standards.targetP} />
            <RadialGauge label="Potassium" value={soil.K || 0} min={0} max={600} ideal={standards.targetK} />
          </div>
        </div>

        {/* RIGHT BOX: Comparative Bar Chart */}
        <div style={{
          background: C.whiteOverlay, padding: 24, borderRadius: 20,
          border: `1px solid ${C.mintFresh}44`, height: 320
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.leafDeep, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📊</span> Actual vs Ideal Levels
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#706f6fff" />
              <XAxis dataKey="name" stroke={C.leafDeep} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={C.leafDeep} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey="value" name="Your Soil" fill={C.mintFresh} radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="ideal" name="Ideal Target" fill="#706f6fff" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 3. BOTTOM: Recommendations (Existing) */}
      <div style={{
        background: C.whiteOverlay, backdropFilter: "blur(12px)",
        borderRadius: 20, padding: 24, border: `1px solid ${C.mintFresh}44`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.leafDeep, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span>💡</span> Analysis & Recommendations
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
          {result.deficiencies.map((d, i) => (
            <li key={i} style={{
              padding: "12px 16px", background: "rgba(255,107,107,0.08)",
              borderRadius: 12, borderLeft: `4px solid #ff6b6b`,
              fontSize: 14, color: C.leafDeep, lineHeight: 1.5,
            }}>
              <strong>{d.nutrient} is {d.status}</strong>: Deficiency of {d.deficiency_percentage}% detected.
            </li>
          ))}
          {result.recommendations.map((r, i) => (
            <li key={`rec-${i}`} style={{
              padding: "16px", background: "rgba(95,255,138,0.08)",
              borderRadius: 12, border: `1px solid ${C.mintFresh}44`,
              fontSize: 14, color: C.leafDeep, lineHeight: 1.5,
              display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12
            }}>
              <div>
                Apply <strong>{r.bags} bags</strong> of <strong>{r.product}</strong>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Est. Cost: ₹{r.cost}</div>
              </div>

              {/* Retailer Links */}
              {r.buyLinks && (
                <div style={{ display: "flex", gap: 8 }}>
                  {r.buyLinks.amazon && (
                    <a href={r.buyLinks.amazon} target="_blank" rel="noopener noreferrer" style={{
                      textDecoration: "none", padding: "8px 16px", borderRadius: 100,
                      background: "#FF9900", color: "#fff", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 4
                    }}>
                      Amazon ↗
                    </a>
                  )}
                  {r.buyLinks.google && (
                    <a href={r.buyLinks.google} target="_blank" rel="noopener noreferrer" style={{
                      textDecoration: "none", padding: "8px 16px", borderRadius: 100,
                      background: "#4285F4", color: "#fff", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 4
                    }}>
                      Search ↗
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── History Tab ── */
function HistoryTab() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/trends')
      .then(res => res.json())
      .then(data => {
        // Format data for Recharts
        const formatted = data.map(scan => ({
          date: new Date(scan.scannedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          fullDate: new Date(scan.scannedAt).toLocaleDateString(),
          N: scan.soil.N,
          P: scan.soil.P,
          K: scan.soil.K,
          ph: scan.soil.pH
        }));
        setTrends(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch trends", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", maxWidth: 1000 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Skeleton width={300} height={40} style={{ margin: "0 auto 20px" }} />
          <Skeleton width="100%" height={300} style={{ borderRadius: 20 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height={80} style={{ borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1000 }}>
      <div style={{
        fontSize: 28, fontWeight: 800, color: C.leafDeep,
        fontFamily: "'Playfair Display',serif", marginBottom: 20, textAlign: "center",
      }}>Soil Health Trends</div>

      {trends.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#0a4a1e66" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📉</div>
          <div>No history found. Scan more cards to see trends!</div>
        </div>
      ) : (
        <>
          {/* Trend Chart */}
          <div style={{
            background: C.whiteOverlay, backdropFilter: "blur(12px)",
            borderRadius: 20, padding: 24, border: `1px solid ${C.mintFresh}44`,
            marginBottom: 32, height: 400
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.leafDeep, marginBottom: 16 }}>
              📈 Nutrient History (N-P-K)
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke={C.leafDeep} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={C.leafDeep} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line type="monotone" dataKey="N" stroke={C.mintFresh} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Nitrogen" />
                <Line type="monotone" dataKey="P" stroke={C.goldSun} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="K" stroke="#2c7be5" strokeWidth={3} dot={{ r: 4 }} name="Potassium" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* History List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {trends.slice().reverse().map((scan, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: C.whiteOverlay, padding: "16px 24px", borderRadius: 16,
                border: `1px solid ${C.mintFresh}22`
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.leafDeep }}>Analysis Report</div>
                  <div style={{ fontSize: 12, color: "#0a4a1e88" }}>{scan.fullDate}</div>
                </div>
                <div style={{ display: "flex", gap: 16, textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#0a4a1e66" }}>N</div>
                    <div style={{ fontWeight: 700, color: C.mintFresh }}>{scan.N}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#0a4a1e66" }}>P</div>
                    <div style={{ fontWeight: 700, color: C.goldSun }}>{scan.P}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#0a4a1e66" }}>K</div>
                    <div style={{ fontWeight: 700, color: "#2c7be5" }}>{scan.K}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#0a4a1e66" }}>pH</div>
                    <div style={{ fontWeight: 700, color: C.leafDeep }}>{scan.ph}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Cart Tab ── */
function CartTab({ cart, setCart, result }) {
  const total = cart.reduce((sum, item) => sum + (item.qty || item.bags) * (item.price || item.cost), 0);

  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <div style={{
        fontSize: 28, fontWeight: 800, color: C.leafDeep,
        fontFamily: "'Playfair Display',serif", marginBottom: 20, textAlign: "center",
      }}>Your Cart</div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#0a4a1e66" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <div style={{ fontSize: 16 }}>Your cart is empty</div>
          {result && <p>Check Dashboard for recommendations to add!</p>}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {cart.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                background: C.whiteOverlay,
                borderRadius: 16, padding: "16px 20px",
                border: `1px solid ${C.mintFresh}44`,
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 32 }}>{item.img || "🌾"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.leafDeep }}>{item.product || item.name}</div>
                  <div style={{ fontSize: 12, color: "#0a4a1e66" }}>{item.unit || "Bag"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{item.bags || item.qty} x</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.leafDeep, minWidth: 80, textAlign: "right" }}>
                  ₹{(item.bags || item.qty) * (item.cost || item.price)}
                </div>
                <button
                  onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                  style={{ marginLeft: 10, border: "none", background: "transparent", cursor: "pointer", color: "#ff6b6b", fontSize: 18 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{
            background: `${C.mintFresh}18`,
            borderRadius: 16, padding: 20,
            border: `2px solid ${C.mintFresh}66`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.leafDeep }}>Subtotal:</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: C.leafDeep }}>₹{total.toLocaleString()}</span>
            </div>
            <button style={{
              width: "100%", padding: "14px", borderRadius: 100,
              background: "linear-gradient(135deg,#1a7a30,#2dd870)",
              border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 6px 28px rgba(45,216,112,0.4)",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.target.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              onClick={() => alert("Proceeding to checkout!")}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main App ── */
export default function MittiScanApp() {
  const [view, setView] = useState("landing"); // "landing" | "app"
  const [activeTab, setActiveTab] = useState("upload");

  // State from VerifyEdit
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
      // Pass crop to dashboard for chart standards
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
        <>
          {/* ── Landing Screen with Canvas ── */}
          <FieldCanvas />
          <GlowOrbs />
          <LeafParticles />
          <GrassLayer />

          <div style={{
            position: "fixed", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: 20,
            animation: "contentFadeIn 0.8s ease-out",
          }}>

            <svg viewBox="0 0 72 72" fill="none"
              style={{
                width: 110, height: 110, marginBottom: 24,
                animation: "logoBounce 6s ease-in-out infinite"
              }}>
              <circle cx="36" cy="36" r="33" stroke="#2dd870" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.6" />
              <rect x="14" y="42" width="44" height="20" rx="4" fill="#5c3a1e" /> {/* Soil */}
              <path d="M30 42 L30 20 Q36 10 42 20 L42 42" stroke="#2dd870" strokeWidth="3" fill="none" strokeLinecap="round" /> {/* Sprout */}
              <circle cx="30" cy="18" r="3" fill="#5fff8a" />
              <circle cx="42" cy="14" r="2.5" fill="#b8ff5a" />
            </svg>

            <h1 style={{
              fontSize: "clamp(3.5rem, 8vw, 6rem)", fontWeight: 900,
              fontFamily: "'Playfair Display',serif", color: C.leafDeep,
              letterSpacing: -2, lineHeight: 1.1, marginBottom: 16,
              textShadow: "0 10px 30px rgba(45,216,112,0.3)"
            }}>
              Mitti<span style={{ color: C.mintFresh }}>Scan</span> AI
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)", color: C.forestMid, maxWidth: 600,
              lineHeight: 1.6, marginBottom: 48, opacity: 0.9, fontWeight: 500,
              textShadow: "0 2px 10px rgba(255,255,255,0.8)"
            }}>
              Deep insights from just a photo. <br />
              <span style={{ opacity: 0.7, fontSize: "0.9em" }}>Upload your Soil Health Card & get AI-powered fertilizer recommendations instantly.</span>
            </p>

            <button
              onClick={() => setView("app")}
              style={{
                position: "relative", overflow: "hidden",
                padding: "20px 56px", borderRadius: 100,
                background: "linear-gradient(135deg, #1a7a30 0%, #2dd870 100%)",
                border: "none", color: "#fff", fontSize: 18, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 10px 40px rgba(45,216,112,0.4)",
                transition: "all 0.3s ease",
                animation: "btnPulse 3s infinite"
              }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 15px 50px rgba(45,216,112,0.6)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 10px 40px rgba(45,216,112,0.4)"; }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>🌱 Scan Your Soil Card</span>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation: "shimmerSlide 3s infinite linear"
              }} />
            </button>
          </div>
        </>
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
        </div >
      )
      }

    </>
  );
}
