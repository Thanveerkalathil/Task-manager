import "../assets/admin.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { db } from "../firebase-config";
import { addDoc, collection, getDocs } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

const AddUserPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "123456",
    role: "user",
    profileComplete: false, 
  });
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  useEffect(() => {
    const userCollectionRef = collection(db, "users");
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUser.username && newUser.email) {
      try {
        // Correct URL construction using template literals
        const url = `${import.meta.env.VITE_API_URL}/create-user`;

        // Use Axios to send a POST request
        const response = await axios.post(url, {
          email: newUser.email,
          password: newUser.password,
          username: newUser.username,
        });

        // Extract user ID from the response data
        const { uid } = response.data;

        // Add the user to Firestore
        await addDoc(collection(db, "users"), {
          id: uid,
          username: newUser.username,
          email: newUser.email,
          role: "user",
          profileComplete: false, 
        });

        // Update state with the new user and reset the form
        setUsers([...users, { id: uid, ...newUser }]);
        setNewUser({
          username: "",
          email: "",
          password: "123456",
          role: "user",
          profileComplete: false, 
        });
        setError("");
        navigate("/admin");
      } catch (error) {
        // More detailed error handling for Axios
        if (error.response) {
          // Server responded with a status other than 200 range
          setError(error.response.data.message || "Failed to create user");
        } else if (error.request) {
          // Request was made but no response received
          setError("No response from server. Please try again.");
        } else {
          // Something happened in setting up the request
          setError(error.message);
        }
      }
    } else {
      setError("Username and Email are required.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        toggleSidebar={toggleSidebar}
        className="fixed top-0 left-0 right-0 z-10"
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex justify-center items-center bg-gray-200 p-8">
          <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg border border-none">
            <h2 className="text-3xl text-center font-bold text-black mb-6 font-mono">
              Add User
            </h2>
            <form onSubmit={handleAddUser}>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="mb-5">
                <label
                  htmlFor="username"
                  className="block text-lg font-medium text-black mb-2 font-mono"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                  className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg shadow-sm font-mono"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-black mb-2 font-mono"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  className="w-full p-3 bg-gray-100 font-mono text-black border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold font-mono rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition"
              >
                Add User
              </button>
            </form>
          </div>
        </main>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed lg:static top-0 lg:top-auto left-0 h-full lg:h-auto w-80 bg-gray-800 text-white flex flex-col z-10 transform lg:transform-none transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <h2 className="text-2xl font-bold text-center p-4 font-mono">
            Users
          </h2>
          <ul className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.id}
                className="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-medium font-mono">
                    {user.username}
                  </p>
                  <p className="text-gray-400 font-mono">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
export default AddUserPage;
