import React, { useState, useEffect } from "react";
import { C } from "./constants";
import { Skeleton } from "./Shared";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export function HistoryTab() {
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
