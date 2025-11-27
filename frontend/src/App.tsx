import './App.css'
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 👇 Login page route */}
        <Route path="/login" element={<Login />} />
        {/* 👇 Register page route */}
        <Route path="/register" element={<Register />} />
        

        

      </Routes>
    </Router>
  );
};

export default App
