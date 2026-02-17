import DeficiencyList from "../components/DeficiencyList";
import Gauge from "../components/Gauge";

export default function Dashboard() {
  return (
    <div style={{ padding: 80, color: "white" }}>
      <h2>Soil Health Dashboard</h2>

      <div style={{ display: "flex", gap: 40 }}>
        <Gauge label="Nitrogen" value={82} />
        <Gauge label="Phosphorus" value={47} />
        <Gauge label="Potassium" value={68} />
      </div>

      <DeficiencyList />
    </div>
  );
}
