import React from "react";
import { C } from "./constants";

export const Skeleton = ({ width, height, style }) => (
    <div style={{
        width, height, background: "rgba(0,0,0,0.06)", borderRadius: 8,
        animation: "pulse 1.5s infinite ease-in-out", ...style
    }} />
);

export const LoadingOverlay = ({ message, isVerified }) => (
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

export const ErrorBanner = ({ message, onClose }) => (
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
