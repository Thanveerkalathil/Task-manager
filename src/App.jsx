import React from "react";
import AdminLogin from "./components/AdminLogin";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./components/AdminPage";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
