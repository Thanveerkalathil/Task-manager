import { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import { auth } from "./firebase-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLogin from "./pages/UserLogin";
import UserPage from "./pages/UserPage";
import Profile from "./pages/Profile";
import AuthHandler from "./components/AuthHandler";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const RequireAuth = ({ children }) => {
    if (!user) {
      return <Navigate to="/" />;
    }
    if (isAdmin) {
      return <Navigate to="/adminPanel" />;
    }
    return children;
  };

  const RequireAdminAuth = ({ children }) => {
    return isAdmin ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <div>
        {user && <AuthHandler user={user} setIsAdmin={setIsAdmin} />}
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/user" /> : <UserLogin />}
          />
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserPage />
              </RequireAuth>
            }
          />
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={isAdmin ? <Navigate to="/adminPanel" /> : <AdminLogin />}
          />
          <Route
            path="/adminPanel"
            element={
              <RequireAdminAuth>
                <AdminPage />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App;
