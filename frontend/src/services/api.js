const API_BASE = "http://localhost:5000/api";

/**
 * Upload image and get OCR soil data
 */
export async function scanCard(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("OCR failed");
  }

  return response.json();
}

/**
 * Analyze soil and get interpretation + recommendations
 */
export async function analyzeSoil(payload) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  return response.json();
}
