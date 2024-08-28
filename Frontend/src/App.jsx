import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import UserLogin from "./pages/UserLogin";
import UserPage from "./pages/UserPage";
import Profile from "./pages/Profile";
import { auth, db } from "./firebase-config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs, query, where } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Check if the user is an admin
        const adminCollectionRef = collection(db, "admin");
        const q = query(adminCollectionRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        setIsAdmin(!querySnapshot.empty);

        // Check if the profile is complete
        const userCollectionRef = collection(db, "users");
        const userQuery = query(userCollectionRef, where("id", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0].data();
          setProfileComplete(userDoc.profileComplete);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setProfileComplete(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const RequireAuth = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        navigate("/", { replace: true });
      } else if (isAdmin) {
        navigate("/adminPanel", { replace: true });
      } else if (!profileComplete) {
        navigate("/profile", { replace: true });
        console.log("Profile Complete")
      }
    }, [user, isAdmin, profileComplete, navigate]);

    if (!user || isAdmin || !profileComplete) {
      return null;
    }

    return children;
  };

  const RequireAdminAuth = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
      if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
      return null;
      
    }
    return children;
  };

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route

            path="/"
            element={user ? <Navigate to="/user" replace /> : <UserLogin />}
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
            element={isAdmin ? <Navigate to="/adminPanel" replace /> : <AdminLogin />}
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
                <Profile />
            }
          />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
};

export default App;
