import React from "react";
import { C } from "./constants";

export function CartTab({ cart, setCart, result }) {
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
