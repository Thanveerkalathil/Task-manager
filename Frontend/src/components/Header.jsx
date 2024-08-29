import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = ({ toggleSidebar, showFilters, onFilterChange, handleResetTasks }) => {
  const navigate = useNavigate();
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/user");
    } catch (error) {
      console.log("Error logging out:", error.message);
    }
  };

  const handleFilterChange = (filter) => {
    onFilterChange(filter);
    setShowFilterOptions(false); // Close the dropdown after selection
  };

  return (
    <header className="bg-slate-900 text-white flex flex-col md:flex-row w-full">
      <div className="container mx-auto px-4 flex justify-between items-center w-full py-3">
        {/* Logo */}
        <div className="text-sm md:text-2xl font-bold">
          <h1 className="mb-1.5">Welcome {auth.currentUser.email || "User"}</h1>

          {showFilters && (
            <div className="md:flex hidden flex-col space-y-2">
              <div className="text-[16px] font-light text-blue-300 ms-2">
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange("daily")}
                  className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                >
                  Daily
                </button>
                <button
                  onClick={() => handleFilterChange("weekly")}
                  className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleFilterChange("monthly")}
                  className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                >
                  All
                </button>
                <button
                  onClick={() => handleResetTasks()}
                  className="text-sm font-medium py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-700"
                >
                  Reset All Tasks
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center">
          {/* Toggle Button for Mobile */}
          <button
            className="md:hidden py-2 px-3.5 bg-gray-800 text-white rounded-md shadow-md m-2"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
          >
            View Tasks
          </button>

          {/* Filter Options for Mobile */}
          {showFilterOptions && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-slate-800 text-white flex flex-col space-y-2 py-2 px-4">
              <button
                onClick={() => handleFilterChange("daily")}
                className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              >
                Daily
              </button>
              <button
                onClick={() => handleFilterChange("weekly")}
                className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              >
                Weekly
              </button>
              <button
                onClick={() => handleFilterChange("monthly")}
                className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              >
                Monthly
              </button>
              <button
                onClick={() => handleFilterChange("all")}
                className="text-sm font-medium py-1 px-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              >
                All
              </button>
              <button
                onClick={() => {
                  handleResetTasks();
                  setShowFilterOptions(false); // Close the dropdown after resetting tasks
                }}
                className="text-sm font-medium py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              >
                Reset All Tasks
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="py-2 px-6 m-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
