import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MittiScan from "./pages/MittiScan";
import VerifyEdit from "./pages/VerifyEdit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MittiScan />} />
        <Route path="/scan" element={<VerifyEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
