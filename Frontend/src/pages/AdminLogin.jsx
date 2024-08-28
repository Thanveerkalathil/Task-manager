import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
  
      // Check if the logged-in user is an admin
      const adminCollectionRef = collection(db, "admin");
      const q = query(adminCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        toast.error("This email does not have admin privileges.");
        return; // Prevent redirect if not admin
      }
  
      navigate("/adminPanel"); // Redirect to admin panel only if admin
    } catch (error) {
      toast.error("Login failed: " + error.message);
      console.log(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-bold text-black mb-6 text-center font-mono">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-1 font-mono"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              required
              className="w-full p-2 border border-gray-300 rounded font-mono"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-1 font-mono"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              required
              className="w-full p-2 border border-gray-300 rounded font-mono"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
