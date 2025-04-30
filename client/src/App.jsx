import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Plants from "./pages/Plants";
import Recommendation from "./pages/Recommendation";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/recommendation" element={<Recommendation />} />
      </Routes>
    </div>
  );
}

export default App;
