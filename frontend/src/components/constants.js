/* ── Palette ── */
export const C = {
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
export const STARS = Array.from({ length: 160 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.4 + Math.random() * 1.8,
    sp: 0.0008 + Math.random() * 0.003,
    ph: Math.random() * Math.PI * 2,
    col: Math.random() > 0.6 ? "#5fff8a" : Math.random() > 0.5 ? "#b8ff5a" : "#c8fff0",
}));

export const LEAVES = Array.from({ length: 22 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: 18 + Math.random() * 40, rot: Math.random() * 360,
    dur: 6 + Math.random() * 12, delay: Math.random() * -12,
    drift: (Math.random() - 0.5) * 160, opacity: 0.06 + Math.random() * 0.12,
    type: Math.floor(Math.random() * 3),
}));

export const ORBS = Array.from({ length: 6 }, (_, i) => ({
    x: 10 + Math.random() * 80, y: 10 + Math.random() * 80,
    size: 80 + Math.random() * 180, dur: 8 + Math.random() * 12, delay: Math.random() * -10,
    col: [C.mintFresh, C.neonGreen, C.limeGlow, C.dewBlue, "#a8ffcc", "#d4ffb0"][i],
}));

export const GRASS = Array.from({ length: 80 }, (_, i) => {
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

/* ── Hardcoded Standards (Mirroring Backend) ── */
// In a real app, fetch this from API or shared config
export const CROP_STANDARDS = {
    wheat: { targetN: 300, targetP: 40, targetK: 300 },
    rice: { targetN: 250, targetP: 30, targetK: 250 },
    cotton: { targetN: 275, targetP: 35, targetK: 275 },
};
