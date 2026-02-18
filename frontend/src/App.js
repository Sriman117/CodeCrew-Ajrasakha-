import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MittiScan from "./pages/MittiScan";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MittiScan />} />
      </Routes>
    </Router>
  );
}

export default App;
