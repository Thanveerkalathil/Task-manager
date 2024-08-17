import React, { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import { auth } from "./firebase-config";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up the authentication listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={user ? <Navigate to="/adminPanel" /> : <AdminLogin />}
          />
          <Route path="/adminPanel" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
