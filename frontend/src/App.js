import VerifyEdit from "./pages/VerifyEdit";

function App() {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto"
      }}
    >
      <h1>🌱 Mitti-Scan</h1>
      <p>
        Soil Health Card Digitizer & Fertilizer Recommendation System
      </p>

      <VerifyEdit />
    </div>
  );
}

export default App;
