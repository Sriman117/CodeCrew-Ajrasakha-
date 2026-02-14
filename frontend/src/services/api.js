const API_BASE = "http://localhost:5000";

export async function analyzeSoil(data) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function scanCard() {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST"
  });
  return res.json();
}
