import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SPKJurusan from "./Metode/SawPage"; // SAW page
import TOPSISPage from "./Metode/TopsisPage";
import PMPage from "./Metode/PmPage";
import MAUTPage from "./Metode/MautPage";
import WPPage from "./Metode/WpPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SPKJurusan />} />
        <Route path="/topsis" element={<TOPSISPage />} />
        <Route path="/pm" element={<PMPage />} />
        <Route path="/wp" element={<WPPage />} />
        <Route path="/maut" element={<MAUTPage />} />
      </Routes>
    </Router>
  );
};

export default App;
