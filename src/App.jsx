import React, { useEffect, useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import { auth, db } from "./firebase-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLogin from "./pages/UserLogin";
import UserPage from "./pages/UserPage";
import TaskModal from "./components/TaskModal";
import Profile from "./pages/Profile";
import { collection, getDocs, query, where } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        // Check if the user is an admin
        const checkAdmin = async () => {
          const adminCollectionRef = collection(db, "admin");
          const q = query(adminCollectionRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          setIsAdmin(!querySnapshot.empty);
        };
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const RequireAuth = React.memo(({ children }) => {
    console.log(children)
    // If user is not logged in, redirect to login
    if (!user) {
      return <Navigate to="/" />;
    }

    // If user is an admin, redirect to admin panel
    if (isAdmin) {
      return <Navigate to="/adminPanel" />;
    }

    // If user is a regular user, render children (user page)
    return children;
  });

  const RequireAdminAuth = ({ children }) => {
    return isAdmin ? children : <Navigate to="/" />;
  }

  return (
    <div>
      <BrowserRouter>
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

          <Route path="/modal" element={<TaskModal />} />
          <Route
            path="/profile"
            element={
              <RequireAuth >
                <Profile />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
};

export default App;
