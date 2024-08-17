import React, { useEffect, useState } from "react";
import Header from "./Header";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const AddUserPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "defaultPassword",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const userCollectionRef = collection(db, "users");
  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getUsers();
  }, [users]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.username && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ username: "", email: "", password: "defaultPassword" });
      setError("");
    } else {
      setError("Username and Email are required.");
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-wrap justify-center items-start flex-1 bg-gray-200 px-4 md:px-16 py-8 gap-8 overflow-hidden">
        {/* Add Button */}
        <div className="w-full h-96 md:w-1/2 lg:w-1/3 bg-white p-6 rounded-lg shadow-lg border border-none">
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
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold  font-mono rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition"
            >
              Add User
            </button>
          </form>
        </div>
        {/* View Users Section */}
        <div className="w-full h-96 md:w-1/2 lg:w-1/3 bg-white p-6 rounded-lg shadow-lg border border-none">
          <h2 className="text-3xl text-center font-semibold text-black mb-6 font-mono">
            View Users
          </h2>
          <ul className="bg-white rounded-lg shadow-lg border border-none">
            {users.map((user) => (
              <li
                key={user.id}
                className="p-4 border-b last:border-b-0 border-gray-300 flex justify-between items-center"
              >
                <div>
                  <p className="text-black font-medium font-mono">
                    {user.username}
                  </p>
                  <p className="text-black font-mono">{user.email}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="py-2 px-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition font-mono"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
