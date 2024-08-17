import React from "react";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleLogout=async() => {
    try {
    await auth.signOut();
    navigate('/adminLogin')
    console.log("Admin logout successfuly completed")
  }catch(error){
    console.log("Error logging out:",error.message)
  }
}
  return (
    <header className="bg-slate-700 text-white shadow-lg flex">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold py-3 font-mono">
          Task Manager Admin
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="font-mono py-2 px-6 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 ease-in-out">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
