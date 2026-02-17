import { useState } from "react";
import { analyzeSoil, scanCard } from "../services/api";

function VerifyEdit() {
  const [soil, setSoil] = useState({
    N: "",
    P: "",
    K: "",
    OC: "",
    pH: ""
  });

  const [crop, setCrop] = useState("wheat");
  const [farmSize, setFarmSize] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- CART ---------------- */
  const [cart, setCart] = useState([]);

  /* ---------------- IMPACT METRICS ---------------- */
  const [cardsScanned, setCardsScanned] = useState(0);
  const [totalDeficiencies, setTotalDeficiencies] = useState(0);
  const [totalCorrectionCost, setTotalCorrectionCost] = useState(0);

  /* ---------------- OCR ---------------- */
  async function handleScan() {
    if (!image) {
      setError("Please upload a soil health card image.");
      return;
    }

    try {
      setLoading(true);
      const data = await scanCard(image);
      setSoil(data.soilData);
      setError("");
    } catch {
      setError("OCR failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- ANALYSIS ---------------- */
  async function handleAnalyze() {
  // Basic validation
  if (
    soil.N === "" ||
    soil.P === "" ||
    soil.K === "" ||
    soil.OC === "" ||
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

    setResult(response);
    setCart([]);

    setCardsScanned(prev => prev + 1);
    setTotalDeficiencies(prev =>
      prev + response.deficiencies.length
    );
    setTotalCorrectionCost(prev =>
      prev + response.totalCost
    );

    setError("");

  } catch {
    setError("Analysis failed.");
  }
}


  /* ---------------- CART ---------------- */
  function addToCart(product) {
    const exists = cart.find(
      item => item.product === product.product
    );
    if (exists) return;
    setCart([...cart, product]);
  }

  function removeFromCart(index) {
    setCart(cart.filter((_, i) => i !== index));
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.cost,
    0
  );

  return (
    <center>
    <div style={{ marginTop: 20 }}>
      <h2>Soil Health Impact Dashboard</h2>

      {/* ---------------- IMPACT METRICS ---------------- */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 8
        }}
      >
        <div>
          <strong>Cards Analyzed</strong>
          <div style={{ fontSize: 18 }}>{cardsScanned}</div>
        </div>

        <div>
          <strong>Total Deficiencies Found</strong>
          <div style={{ fontSize: 18 }}>{totalDeficiencies}</div>
        </div>

        <div>
          <strong>Total Estimated Correction Cost</strong>
          <div style={{ fontSize: 18 }}>
            ₹{totalCorrectionCost}
          </div>
        </div>
      </div>

      {/* ---------------- UPLOAD & SCAN ---------------- */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <br />

      <button onClick={handleScan}>
        {loading ? "Scanning..." : "Scan Card"}
      </button>

      {/* ---------------- VERIFY & EDIT ---------------- */}
      <div style={{ marginTop: 15 }}>
        {Object.keys(soil).map(key => (
          <div key={key}>
            <label>{key}: </label>
            <input
              type="number"
              value={soil[key]}
              onChange={(e) =>
                setSoil({
                  ...soil,
                  [key]: Number(e.target.value)
                })
              }
            />
          </div>
        ))}
      </div>

      <div>
        <label>Crop: </label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          <option value="wheat">Wheat</option>
          <option value="rice">Rice</option>
          <option value="cotton">Cotton</option>
        </select>
      </div>

      <div>
        <label>Farm Size (acres): </label>
        <input
          type="number"
          value={farmSize}
          min="1"
          onChange={(e) => setFarmSize(Number(e.target.value))}
        />
      </div>

      <button onClick={handleAnalyze}>
        Analyze Soil
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---------------- RESULTS ---------------- */}
      {result && (
        <div style={{ marginTop: 30 }}>

          {/* Soil Interpretation */}
          <h3>Soil Interpretation</h3>
          <ul>
            {Object.entries(result.interpretation).map(
              ([key, value]) => (
                <li key={key}>
                  <strong>{key}</strong>: {value}
                </li>
              )
            )}
          </ul>

          {/* Deficiency Analysis */}
          {result.deficiencies.length > 0 && (
            <>
              <h3>Deficiency Analysis</h3>
              <ul>
                {result.deficiencies.map((d, i) => (
                  <li key={i}>
                    <strong>
                      {d.nutrient} — {d.status}
                    </strong>
                    {d.deficiency_percentage !== undefined && (
                      <div style={{ fontSize: 13 }}>
                        Deficiency: {d.deficiency_percentage}%
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Recommendations */}
          <h3>Recommended Products</h3>
          {result.recommendations.map((r, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6
              }}
            >
              <strong>{r.product}</strong>
              <div>Bags: {r.bags}</div>
              <div>Cost: ₹{r.cost}</div>

              <button onClick={() => addToCart(r)}>
                Add to Cart
              </button>
            </div>
          ))}

          {/* Cart */}
          <h3 style={{ marginTop: 30 }}>
            Shopping Cart
          </h3>

          {cart.length === 0 && <p>Cart is empty.</p>}

          {cart.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong>{item.product}</strong>
              <div>Bags: {item.bags}</div>
              <div>Cost: ₹{item.cost}</div>
              <button onClick={() => removeFromCart(i)}>
                Remove
              </button>
            </div>
          ))}

          <h3>Total Cart Cost: ₹{cartTotal}</h3>
        </div>
      )}
    </div>
    </center>
  );
}

export default VerifyEdit;
