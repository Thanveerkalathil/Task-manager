import { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import { auth } from "./firebase-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLogin from "./pages/UserLogin";
import UserPage from "./pages/UserPage";
// import TaskModal from "./components/TaskModal";

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

  const RequireAuth = ({ children }) => {
    return user ? children : <Navigate to="/" />;
  };

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={user ? <Navigate to="/adminPanel" /> : <AdminLogin />}
          />
          <Route
            path="/adminPanel"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
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
          {/* <Route path="/modal" element={<TaskModal />} />. */}
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
};

export default App;
