import { useState } from "react";
import { analyzeSoil, scanCard } from "../services/api";

function VerifyEdit() {
  const [soil, setSoil] = useState({
    N: "",
    P: "",
    K: "",
    pH: ""
  });

  const [crop, setCrop] = useState("wheat");
  const [farmSize, setFarmSize] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Scan Card (stub)
  async function handleScan() {
    const data = await scanCard();
    setSoil(data.soilData);
    setResult(null);
    setError("");
  }

  // Analyze Soil
  async function handleAnalyze() {
    setError("");
    setResult(null);

    // Basic validation
    if (
      soil.N === "" ||
      soil.P === "" ||
      soil.K === "" ||
      soil.pH === ""
    ) {
      setError("All soil values are required.");
      return;
    }

    if (soil.pH < 3 || soil.pH > 9) {
      setError("Soil pH must be between 3 and 9.");
      return;
    }

    try {
      const response = await analyzeSoil({
        soil,
        crop,
        farmSize
      });

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Scan & Verify Soil Card</h2>

      <button onClick={handleScan}>Scan Card</button>

      <div style={{ marginTop: 15 }}>
        {Object.keys(soil).map((key) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <label>{key}: </label>
            <input
              type="number"
              value={soil[key]}
              onChange={(e) => {
                const value = e.target.value;
                setSoil({
                  ...soil,
                  [key]: value === "" ? "" : Number(value)
                });
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Crop: </label>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          <option value="wheat">Wheat</option>
          <option value="rice">Rice</option>
          <option value="cotton">Cotton</option>
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Farm Size (acres): </label>
        <input
          type="number"
          value={farmSize}
          min="1"
          onChange={(e) => setFarmSize(Number(e.target.value))}
        />
      </div>

      <button style={{ marginTop: 15 }} onClick={handleAnalyze}>
        Analyze Soil
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: 15 }}>
          <h3>Soil Interpretation</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default VerifyEdit;
