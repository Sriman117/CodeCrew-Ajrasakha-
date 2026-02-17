export default function MittiScanLayout({ children }) {
  return (
    <>

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeSoil, scanCard } from "../services/api";

/* ─────────────────────────────────────────
   STATIC DATA (created once, never changes)
───────────────────────────────────────── */
const STRATA = [
  { y: 0.65, amp: 18, freq: 0.003, speed: 0.4, color: "rgba(61,31,0,0.35)" },
  { y: 0.72, amp: 12, freq: 0.004, speed: 0.6, color: "rgba(40,15,0,0.45)" },
  { y: 0.80, amp: 8,  freq: 0.005, speed: 0.8, color: "rgba(20,8,0,0.6)"   },
  { y: 0.88, amp: 5,  freq: 0.006, speed: 1.0, color: "rgba(10,4,0,0.8)"   },
];

const STARS = Array.from({ length: 120 }, () => ({
  x:  Math.random(),
  y:  Math.random() * 0.6,
  r:  0.5 + Math.random() * 1.5,
  sp: 0.001 + Math.random() * 0.003,
  ph: Math.random() * Math.PI * 2,
}));

const WHEAT_STALKS = Array.from({ length: 60 }, (_, i) => {
  const colors = ["#6b8c3f","#4a7c2f","#8aae4f","#5a9040"];
  const x     = (i / 59) * 1440 + (Math.random() - 0.5) * 20;
  const h     = 60 + Math.random() * 80;
  const qx    = x + (Math.random() - 0.5) * 15;
  const rx    = 2.5 + Math.random() * 2;
  const ry    = 6   + Math.random() * 5;
  return {
    x, h, qx,
    color:   colors[Math.floor(Math.random() * 4)],
    sw:      0.5 + Math.random() * 1.5,
    opacity: 0.4 + Math.random() * 0.5,
    delay:   Math.random() * 3,
    dur:     2 + Math.random() * 2,
    grainRx: rx, grainRy: ry,
    grainOp: 0.5 + Math.random() * 0.4,
  };
});

const MOLECULES = [
  { left: "15%", top: "35%", size: 40, dur: "7s",  delay: "0s"  },
  { left: "80%", top: "20%", size: 30, dur: "9s",  delay: "-3s" },
  { left: "88%", top: "70%", size: 35, dur: "11s", delay: "-6s" },
  { left: "8%",  top: "75%", size: 28, dur: "8s",  delay: "-2s" },
];

const CARDS = [
  {
    label: "Nitrogen (N)", value: "82", unit: "%", status: "Adequate Level",
    color: "#e8b84b", barW: "82%", barGrad: "linear-gradient(90deg,#4a8c3f,#76c442)",
    pos: { top: "12%", left: "4%" }, delay: "0s", width: 180,
  },
  {
    label: "Soil pH", value: "6.8", unit: "", status: "Optimal Range",
    color: "#76c442", barW: "68%", barGrad: "linear-gradient(90deg,#76c442,#00f5c4)",
    pos: { top: "55%", left: "6%" }, delay: "-3s", width: 160,
  },
  {
    label: "Phosphorus (P)", value: "47", unit: "kg/ha", status: "Medium",
    color: "#e8b84b", barW: "47%", barGrad: "linear-gradient(90deg,#e8b84b,#c97d2e)",
    pos: { top: "18%", right: "4%" }, delay: "-5s", width: 180,
  },
  {
    label: "Organic Carbon", value: "0.72", unit: "", status: "% / Low",
    color: "#00f5c4", barW: "30%", barGrad: "linear-gradient(90deg,#00f5c4,#0099aa)",
    pos: { top: "62%", right: "5%" }, delay: "-7s", width: 160,
  },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

/** Animated Canvas — terrain, orbs, light rays, stars */
function TerrainCanvas() {
  const canvasRef = useRef(null);
  const tRef      = useRef(0);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const t = tRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background radial gradient
      const bgGrad = ctx.createRadialGradient(w*0.5,h*0.4,0, w*0.5,h*0.5,w*0.8);
      bgGrad.addColorStop(0,   "#1a0800");
      bgGrad.addColorStop(0.5, "#0d0400");
      bgGrad.addColorStop(1,   "#050100");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Soil strata
      STRATA.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = h * s.y
            + Math.sin(x * s.freq + t * s.speed) * s.amp
            + Math.sin(x * s.freq * 1.7 + t * s.speed * 1.3) * s.amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();
      });

      // Amber orb glow
      const orb = ctx.createRadialGradient(w*0.5,h*0.42,0, w*0.5,h*0.42,w*0.35);
      orb.addColorStop(0,   "rgba(201,125,46,0.08)");
      orb.addColorStop(0.5, "rgba(232,184,75,0.04)");
      orb.addColorStop(1,   "transparent");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, w, h);

      // Cyan top glow
      const cyanOrb = ctx.createRadialGradient(w*0.5,0,0, w*0.5,0,w*0.5);
      cyanOrb.addColorStop(0, "rgba(0,245,196,0.06)");
      cyanOrb.addColorStop(1, "transparent");
      ctx.fillStyle = cyanOrb;
      ctx.fillRect(0, 0, w, h);

      // Rotating light rays
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.05;
        const x1 = w * 0.5, y1 = h * 0.4;
        const x2 = x1 + Math.cos(angle) * w * 0.6;
        const y2 = y1 + Math.sin(angle) * h * 0.5;
        const ray = ctx.createLinearGradient(x1, y1, x2, y2);
        ray.addColorStop(0, "rgba(201,125,46,0.04)");
        ray.addColorStop(1, "transparent");
        const perp = angle + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x1 + Math.cos(perp)*30, y1 + Math.sin(perp)*30);
        ctx.lineTo(x2 + Math.cos(perp)*80, y2 + Math.sin(perp)*80);
        ctx.lineTo(x2 - Math.cos(perp)*80, y2 - Math.sin(perp)*80);
        ctx.lineTo(x1 - Math.cos(perp)*30, y1 - Math.sin(perp)*30);
        ctx.fillStyle = ray;
        ctx.fill();
      }

      // Star field
      STARS.forEach(s => {
        const alpha = 0.2 + 0.3 * Math.sin(t * s.sp * 50 + s.ph);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      tRef.current += 0.008;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}

/** Wheat SVG layer at bottom */
function WheatLayer() {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      zIndex: 3, pointerEvents: "none", height: 200,
    }}>
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
           style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3d1f00" stopOpacity="0" />
            <stop offset="60%"  stopColor="#1a0d00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0d0500" stopOpacity="1" />
          </linearGradient>
        </defs>
        <ellipse cx="720" cy="200" rx="900" ry="80" fill="#1a0d00" opacity="0.8" />
        <rect x="0" y="160" width="1440" height="40" fill="url(#soilGrad)" />
        {WHEAT_STALKS.map((s, i) => (
          <g key={i}>
            <path
              d={`M${s.x},180 Q${s.qx},${180 - s.h / 2} ${s.x},${180 - s.h}`}
              stroke={s.color} strokeWidth={s.sw} fill="none" opacity={s.opacity}
              style={{
                transformOrigin: "bottom center",
                animation: `wheatWave ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
              }}
            />
            <ellipse
              cx={s.x} cy={180 - s.h}
              rx={s.grainRx} ry={s.grainRy}
              fill="#e8b84b" opacity={s.grainOp}
              style={{
                transformOrigin: "bottom center",
                animation: `wheatWave ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Floating molecule icons */
function Molecules() {
  return (
    <>
      {MOLECULES.map((m, i) => (
        <div key={i} style={{
          position: "fixed", left: m.left, top: m.top,
          zIndex: 2, pointerEvents: "none",
          animationName: "moleculeFloat",
          animationDuration: m.dur,
          animationDelay: m.delay,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}>
          <svg width={m.size} height={m.size} viewBox="0 0 40 40" fill="none" opacity="0.4">
            <circle cx="20" cy="20" r="4"  fill="#c97d2e" />
            <circle cx="8"  cy="12" r="3"  fill="#76c442" />
            <circle cx="32" cy="12" r="3"  fill="#00f5c4" />
            <circle cx="8"  cy="28" r="3"  fill="#e8b84b" />
            <circle cx="32" cy="28" r="3"  fill="#76c442" />
            <line x1="20" y1="20" x2="8"  y2="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="20" y1="20" x2="32" y2="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="20" y1="20" x2="8"  y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="20" y1="20" x2="32" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          </svg>
        </div>
      ))}
    </>
  );
}

/** Soil particle system */
function ParticleLayer() {
  const [particles, setParticles] = useState([]);
  const counterRef = useRef(0);

  const spawnParticle = useCallback(() => {
    const id      = counterRef.current++;
    const size    = 2 + Math.random() * 8;
    const colors  = ["#6b3a1f","#c97d2e","#e8b84b","#76c442","#00f5c4"];
    const col     = colors[Math.floor(Math.random() * 5)];
    const x       = Math.random() * 100;
    const drift   = (Math.random() - 0.5) * 200;
    const dur     = 6 + Math.random() * 14;
    const p = { id, size, col, x, drift, dur, delay: Math.random() * -dur };

    setParticles(prev => [...prev, p]);
    setTimeout(() => {
      setParticles(prev => prev.filter(q => q.id !== id));
    }, (dur + 2) * 1000);
  }, []);

  useEffect(() => {
    // Initial burst
    for (let i = 0; i < 80; i++) spawnParticle();
    const iv = setInterval(spawnParticle, 300);
    return () => clearInterval(iv);
  }, [spawnParticle]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.size, height: p.size,
          left: `${p.x}%`,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${p.col}, rgba(0,0,0,0.5))`,
          boxShadow: `0 0 ${p.size * 2}px ${p.col}44`,
          "--drift": `${p.drift}px`,
          animationName: "floatSoil",
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/** 3D Floating data card */
function SoilCard({ card, mousePos }) {
  const dir = CARDS.indexOf(card) % 2 === 0 ? 1 : -1;
  const cx  = mousePos.x * 20;
  const cy  = mousePos.y * 10;
  const t   = Date.now() * 0.001;
  const idx = CARDS.indexOf(card);

  return (
    <div style={{
      position: "fixed",
      ...card.pos,
      width: card.width,
      height: 110,
      background: "rgba(20,8,0,0.7)",
      border: "1px solid rgba(201,125,46,0.4)",
      borderRadius: 12,
      backdropFilter: "blur(10px)",
      zIndex: 5,
      padding: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      animationName: "cardFloat",
      animationDuration: "10s",
      animationDelay: card.delay,
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
      transformStyle: "preserve-3d",
    }}>
      {/* Shimmer overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 12,
        background: "linear-gradient(135deg, rgba(201,125,46,0.1), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        fontSize: 9, letterSpacing: 2, color: "#00f5c4",
        textTransform: "uppercase", marginBottom: 6, fontWeight: 600,
        fontFamily: "'Rajdhani', sans-serif",
      }}>{card.label}</div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: card.color,
        lineHeight: 1, fontFamily: "'Rajdhani', sans-serif",
      }}>
        {card.value}
        {card.unit && (
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{card.unit}</span>
        )}
      </div>
      <div style={{
        fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2,
        fontFamily: "'Rajdhani', sans-serif",
      }}>{card.status}</div>
      <div style={{
        position: "absolute", bottom: 14, left: 14, right: 14,
        height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          width: card.barW, height: "100%", borderRadius: 2,
          background: card.barGrad,
          animationName: "barFill",
          animationDuration: "3s",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
        }} />
      </div>
    </div>
  );
}

/** Holographic ring trio */
function HoloRings({ mousePos }) {
  const cx = mousePos.x * 20;
  const cy = mousePos.y * 10;
  return (
    <div style={{
      position: "fixed", top: "50%", left: "50%", zIndex: 2, pointerEvents: "none",
      transform: `translate(calc(-50% + ${cx * 0.5}px), calc(-50% + ${cy * 0.3}px))`,
      transition: "transform 0.1s ease-out",
    }}>
      {[
        { size: 300, color: "rgba(201,125,46,0.15)", dur: "20s",  dir: "normal",  style: "solid"  },
        { size: 450, color: "rgba(0,245,196,0.1)",   dur: "30s",  dir: "reverse", style: "dashed" },
        { size: 600, color: "rgba(118,196,66,0.07)", dur: "45s",  dir: "normal",  style: "solid"  },
      ].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          width: r.size, height: r.size,
          borderRadius: "50%",
          border: `1px ${r.style} ${r.color}`,
          top: "50%", left: "50%",
          animationName: "ringRotate",
          animationDuration: r.dur,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: r.dir,
        }} />
      ))}
    </div>
  );
}

/** Logo SVG icon */
function LogoIcon() {
  return (
    <svg
      viewBox="0 0 64 64" fill="none"
      style={{
        width: 64, height: 64,
        animationName: "logoSpin",
        animationDuration: "8s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      }}
    >
      <circle cx="32" cy="32" r="30" stroke="#c97d2e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      <circle cx="32" cy="32" r="22" stroke="#00f5c4" strokeWidth="1"   opacity="0.3"/>
      <rect x="12" y="36" width="40" height="6" rx="2" fill="#6b3a1f" opacity="0.8"/>
      <rect x="12" y="42" width="40" height="6" rx="2" fill="#3d1f00" opacity="0.9"/>
      <rect x="10" y="31" width="44" height="2" rx="1" fill="#00f5c4" opacity="0.9"/>
      <line x1="10" y1="32" x2="54" y2="32" stroke="#00f5c4" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
      <path d="M32 36 C32 28 40 22 44 18" stroke="#76c442" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M32 30 C32 24 24 20 20 16" stroke="#4a8c3f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="44" cy="17" rx="5" ry="3" fill="#76c442"  transform="rotate(-30 44 17)" opacity="0.9"/>
      <ellipse cx="20" cy="15" rx="4" ry="2.5" fill="#4a8c3f" transform="rotate(30 20 15)"  opacity="0.8"/>
    </svg>
  );
}

/* ─────────────────────────────────────────
   GLOBAL KEYFRAME STYLES
───────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes floatSoil {
    0%   { transform: translateY(110vh) translateX(0) rotateZ(0deg) scale(0); opacity:0; }
    5%   { opacity: 1; }
    90%  { opacity: 0.8; }
    100% { transform: translateY(-10vh) translateX(var(--drift)) rotateZ(720deg) scale(1); opacity:0; }
  }
  @keyframes scanPulse {
    0%,100% { opacity:.4; }
    50%     { opacity:1; }
  }
  @keyframes scanBeam {
    0%   { top:-10px; opacity:0; }
    5%   { opacity:1; }
    95%  { opacity:1; }
    100% { top:100vh; opacity:0; }
  }
  @keyframes cardFloat {
    0%,100% { transform: translateY(0)    rotateX(5deg)  rotateY(-5deg); }
    33%     { transform: translateY(-18px) rotateX(-3deg) rotateY(8deg); }
    66%     { transform: translateY(10px)  rotateX(8deg)  rotateY(-8deg); }
  }
  @keyframes barFill {
    from { width:40%; }
    to   { width:80%; }
  }
  @keyframes ringRotate {
    from { transform: translate(-50%,-50%) rotateZ(0deg)   rotateX(70deg); }
    to   { transform: translate(-50%,-50%) rotateZ(360deg) rotateX(70deg); }
  }
  @keyframes moleculeFloat {
    0%,100% { transform: translateY(0)    rotate(0deg);   opacity:.5; }
    50%     { transform: translateY(-40px) rotate(180deg); opacity:1; }
  }
  @keyframes titleGlow {
    0%,100% { filter: drop-shadow(0 0 30px rgba(232,184,75,0.3)); }
    50%     { filter: drop-shadow(0 0 60px rgba(0,245,196,0.5)); }
  }
  @keyframes logoSpin {
    0%,100% { transform: rotateY(0deg); }
    50%     { transform: rotateY(360deg); }
  }
  @keyframes badgePulse {
    0%,100% { border-color:rgba(201,125,46,0.3); color:rgba(255,255,255,0.6); }
    50%     { border-color:rgba(0,245,196,0.5);   color:rgba(0,245,196,0.9); }
  }
  @keyframes btnShimmer {
    0%,70%,100% { transform:translateX(-100%); }
    40%          { transform:translateX(100%); }
  }
  @keyframes btnBreath {
    0%,100% { box-shadow: 0 4px 30px rgba(201,125,46,0.4); }
    50%     { box-shadow: 0 4px 60px rgba(201,125,46,0.7), 0 0 0 8px rgba(201,125,46,0.1); }
  }
  @keyframes dotBlink {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:.3; transform:scale(.5); }
  }
  @keyframes wheatWave {
    from { transform-origin:bottom center; transform:rotate(-5deg); }
    to   { transform-origin:bottom center; transform:rotate(5deg); }
  }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

/* ─────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────── */
export default function MittiScan() {
  const navigate = useNavigate(); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = e => {
      setMousePos({
        x: e.clientX / window.innerWidth  - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <>
      {/* ── Inject keyframes ── */}
      <style>{GLOBAL_CSS}</style>

      <div style={{
        width: "100vw", height: "100vh", overflow: "hidden",
        background: "#0d0500", fontFamily: "'Rajdhani', sans-serif",
        position: "relative",
      }}>

        {/* Layer 0 — Canvas terrain */}
        <TerrainCanvas />

        {/* Layer 1 — Soil particles */}
        <ParticleLayer />

        {/* Layer 2 — Holo rings + molecules */}
        <HoloRings mousePos={mousePos} />
        <Molecules />

        {/* Layer 3 — Scan overlay */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,245,196,0.015) 3px,rgba(0,245,196,0.015) 4px)",
          animationName: "scanPulse", animationDuration: "4s",
          animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
        }} />

        {/* Layer 3 — Wheat */}
        <WheatLayer />

        {/* Layer 4 — Scan beam */}
        <div style={{
          position: "fixed", left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg,transparent,#00f5c4,transparent)",
          boxShadow: "0 0 20px 4px rgba(0,245,196,0.3)",
          zIndex: 4,
          animationName: "scanBeam", animationDuration: "6s",
          animationTimingFunction: "linear", animationIterationCount: "infinite",
        }} />

        {/* Layer 5 — Floating data cards */}
        {CARDS.map((card, i) => (
          <SoilCard key={i} card={card} mousePos={mousePos} />
        ))}

        {/* Layer 6 — Corner HUD brackets */}
        {[
          { top: 20, left: 20, borderTop: "2px solid #c97d2e", borderLeft: "2px solid #c97d2e" },
          { top: 20, right: 20, borderTop: "2px solid #c97d2e", borderRight: "2px solid #c97d2e" },
          { bottom: 20, left: 20, borderBottom: "2px solid #c97d2e", borderLeft: "2px solid #c97d2e" },
          { bottom: 20, right: 20, borderBottom: "2px solid #c97d2e", borderRight: "2px solid #c97d2e" },
        ].map((s, i) => (
          <div key={i} style={{ position: "fixed", width: 60, height: 60, zIndex: 6, ...s }} />
        ))}

        {/* Layer 10 — Main UI overlay */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", pointerEvents: "none",
        }}>
          {/* Logo */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <LogoIcon />
          </div>

          {/* Brand name */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(48px,8vw,96px)",
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            background: "linear-gradient(135deg,#e8b84b 0%,#ffffff 40%,#76c442 70%,#00f5c4 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animationName: "titleGlow",
            animationDuration: "4s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            filter: "drop-shadow(0 0 30px rgba(232,184,75,0.3))",
          }}>
            Mitti-Scan
          </div>

          <div style={{
            fontSize: "clamp(12px,1.5vw,16px)",
            letterSpacing: 6, textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)", marginTop: 12,
            fontWeight: 300,
            animationName: "fadeInUp", animationDuration: "2s",
            animationFillMode: "forwards",
          }}>
            Soil Health Card Digitizer + Actionizer
          </div>

          <div style={{
            fontSize: "clamp(11px,1.2vw,14px)",
            letterSpacing: 3, textTransform: "uppercase",
            color: "#00f5c4", marginTop: 6, opacity: 0.7, fontWeight: 600,
          }}>
            OCR · Agricultural Chemistry · Smart Recommendations · Marketplace
          </div>

          {/* Tech badges */}
          <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
            {["AI-Powered OCR","Soil Analysis","Crop Advisory","Market Connect"].map((b, i) => (
              <div key={b} style={{
                padding: "6px 14px",
                border: "1px solid rgba(201,125,46,0.3)",
                borderRadius: 100, fontSize: 10, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                animationName: "badgePulse",
                animationDuration: "3s",
                animationDelay: `${-i}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}>
                {b}
              </div>
            ))}
          </div>

          {/* CTA button */}
          <button
           onClick={() => navigate("/scan")} 
            style={{
              marginTop: 40,
              padding: "14px 48px",
              background: "linear-gradient(135deg,#c97d2e,#e8b84b)",
              border: "none", borderRadius: 100,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 14, fontWeight: 700, letterSpacing: 4,
              textTransform: "uppercase", color: "#1a0d00",
              cursor: "pointer", pointerEvents: "all",
              position: "relative", overflow: "hidden",
              boxShadow: "0 4px 30px rgba(201,125,46,0.4)",
              animationName: "btnBreath", animationDuration: "3s",
              animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 50px rgba(201,125,46,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 30px rgba(201,125,46,0.4)";
            }}
          >
            {/* Shimmer */}
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
              animationName: "btnShimmer", animationDuration: "3s",
              animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
            }} />
            Scan Your Soil Card
          </button>
        </div>

        {/* Layer 8 — Bottom status bar */}
        <div style={{
          position: "fixed", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 8, display: "flex", alignItems: "center", gap: 24,
          fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}>
          <span>System Active</span>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#00f5c4",
            animationName: "dotBlink", animationDuration: "2s",
            animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          }} />
          <span>Sensor Ready</span>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#76c442",
            animationName: "dotBlink", animationDuration: "2s", animationDelay: "-1s",
            animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
          }} />
          <span>AI Loaded</span>
        </div>

    <div style={{ position: "relative", zIndex: 20 }}>
        {children}
      </div>
      </div>
    </>
  );
}
 </>
  );
}
