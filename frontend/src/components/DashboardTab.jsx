import React, { useState, useEffect } from "react";
import { C, CROP_STANDARDS } from "./constants";
import {
    BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
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

export function DashboardTab({ result, soil, metrics, activeTab, crop }) {
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
