import { useState } from "react";
import { analyzeSoil, scanCard } from "../services/api";

function VerifyEdit() {
  const [soil, setSoil] = useState({
    N: "",
    P: "",
    K: "",
    pH: ""
  });

  const [result, setResult] = useState(null);

  async function handleScan() {
    const data = await scanCard();
    setSoil(data.soilData);
  }

  async function handleAnalyze() {
    const response = await analyzeSoil({
      soil,
      crop: "wheat",
      farmSize: 1
    });
    setResult(response);
  }

  return (
    <div>
      <h2>Scan & Verify Soil Health Card</h2>

      <button onClick={handleScan}>Scan Card</button>

      <div style={{ marginTop: 10 }}>
        {Object.keys(soil).map((key) => (
          <div key={key}>
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

      <button style={{ marginTop: 10 }} onClick={handleAnalyze}>
        Analyze Soil
      </button>

      {result && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default VerifyEdit;
