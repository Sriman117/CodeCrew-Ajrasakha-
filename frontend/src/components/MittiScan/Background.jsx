import React, { useEffect, useRef } from "react";
import { C, STARS, LEAVES, ORBS, GRASS } from "./constants";

export function FieldCanvas() {
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

function LeafShape({ type, size, color = C.mintFresh }) {
    if (type === 0) return <ellipse cx={size / 2} cy={size / 2} rx={size * 0.25} ry={size * 0.45} fill={color} opacity="0.9" transform={`rotate(-20 ${size / 2} ${size / 2})`} />;
    if (type === 1) return <path d={`M${size / 2},${size * 0.1} C${size * 0.8},${size * 0.2} ${size * 0.9},${size * 0.6} ${size / 2},${size * 0.9} C${size * 0.1},${size * 0.6} ${size * 0.2},${size * 0.2} ${size / 2},${size * 0.1}Z`} fill={color} opacity="0.9" />;
    return <path d={`M${size / 2},${size * 0.08} L${size * 0.75},${size * 0.35} L${size * 0.65},${size * 0.92} L${size * 0.35},${size * 0.92} L${size * 0.25},${size * 0.35}Z`} fill={color} opacity="0.9" />;
}

export function LeafParticles() {
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

export function GlowOrbs() {
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

export function GrassLayer() {
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
