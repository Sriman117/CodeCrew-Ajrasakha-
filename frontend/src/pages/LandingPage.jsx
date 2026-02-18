import React from "react";
import { FieldCanvas, GlowOrbs, GrassLayer } from "../components/MittiScan/Background";

export function LandingPage({ onEnterApp }) {
    return (
        <>
            <FieldCanvas />
            <GlowOrbs />
            <GrassLayer />

            <div style={{
                position: "fixed", inset: 0, zIndex: 10,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", paddingBottom: "120px",
                animation: "contentFadeIn 0.8s ease-out",
            }}>

                {/* Logo Removed */}

                <h1 style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "clamp(52px,8.5vw,102px)",
                    fontWeight: 900, letterSpacing: -3, lineHeight: 1,
                    background: "linear-gradient(135deg,#0a4a1e 0%,#1a7a30 30%,#2dd870 60%,#b8ff5a 85%,#f5d060 100%)",
                    WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                    animationName: "titleShimmer", animationDuration: "4s",
                    animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
                }}>Mitti-Scan</h1>

                <p style={{
                    fontSize: "clamp(11px,1.4vw,15px)", letterSpacing: 6,
                    textTransform: "uppercase", color: "rgba(10,46,18,0.55)",
                    marginTop: 10, fontWeight: 400,
                    animationName: "fadeUp", animationDuration: "1.5s", animationFillMode: "both",
                }}>Soil Health Card Digitizer + Actionizer</p>

                <p style={{
                    fontSize: "clamp(10px,1.1vw,13px)", letterSpacing: 2.5,
                    textTransform: "uppercase", color: "#1a7a30", marginTop: 5,
                    fontWeight: 700, opacity: 0.8,
                }}>OCR · Agricultural Chemistry · Smart Recommendations · Marketplace</p>

                <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
                    {["AI-Powered OCR", "Soil Analysis", "Crop Advisory", "Market Connect"].map((b, i) => (
                        <div key={b} style={{
                            padding: "7px 16px",
                            border: "1px solid rgba(45,216,112,0.35)",
                            borderRadius: 100, fontSize: 10, letterSpacing: 2,
                            textTransform: "uppercase", color: "#0a4a1e", fontWeight: 700,
                            background: "rgba(45,216,112,0.08)",
                            backdropFilter: "blur(12px)",
                            animationName: "badgeBeat", animationDuration: "3s",
                            animationDelay: `${-i * 0.8}s`,
                            animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
                        }}>{b}</div>
                    ))}
                </div>

                <button
                    onClick={onEnterApp}
                    style={{
                        marginTop: 36, padding: "15px 52px",
                        background: "linear-gradient(135deg,#1a7a30,#2dd870)",
                        border: "none", borderRadius: 100,
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 14, fontWeight: 700, letterSpacing: 4,
                        textTransform: "uppercase", color: "#fff",
                        cursor: "pointer", position: "relative", overflow: "hidden",
                        animationName: "btnPulse", animationDuration: "3s",
                        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
                        transition: "transform .2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}
                >
                    <span style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",
                        animationName: "shimmerSlide", animationDuration: "3s",
                        animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
                    }} />
                    🌱 Scan Your Soil Card
                </button>
            </div>
        </>
    );
}
