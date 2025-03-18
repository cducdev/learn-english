// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Exam from "./pages/Exam";
import Practice from "./pages/Practice";
import About from "./pages/About";
import Welcome from "./pages/Welcome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<Layout />}>
          <Route path="/exam" element={<Exam />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
