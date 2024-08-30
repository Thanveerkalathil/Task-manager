import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";

const AuthHandler = ({ user, setIsAdmin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (user) {
        // Check if the user is an admin
        const adminCollectionRef = collection(db, "admin");
        const adminQuery = query(
          adminCollectionRef,
          where("email", "==", user.email)
        );
        const adminQuerySnapshot = await getDocs(adminQuery);
        setIsAdmin(!adminQuerySnapshot.empty);

        // Query Firestore to find the user document based on the `id` field
        const usersCollectionRef = collection(db, "users");
        const userQuery = query(
          usersCollectionRef,
          where("id", "==", user.uid)
        );
        const userQuerySnapshot = await getDocs(userQuery);

        if (!userQuerySnapshot.empty) {
          const userDoc = userQuerySnapshot.docs[0];
          const userData = userDoc.data();

          // Navigate based on the firstLogin value
          if (userData.firstLogin) {
            navigate("/profile");
            await updateDoc(userDoc.ref, { firstLogin: false });
          } else {
            navigate("/user");
          }
        } else {
          // If no user document is found, handle appropriately
          console.log("User document not found.");
          // Navigate to a fallback page or handle as needed
          navigate("/"); // Redirect to the login page or a default page
        }
      } else {
        setIsAdmin(false);
      }
    };

    handleAuthChange();
  }, []);

  return null; // This component doesn't render anything
};

export default AuthHandler;
