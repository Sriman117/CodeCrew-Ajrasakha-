import React, { useState } from "react";
import { C } from "./constants";
import { ErrorBanner } from "./Shared";

export function UploadTab({ soil, setSoil, crop, setCrop, farmSize, setFarmSize, onScan, onAnalyze, loading, error, isVerified, setIsVerified, file, setFile, setError }) {
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
