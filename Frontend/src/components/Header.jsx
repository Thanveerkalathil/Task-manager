import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { IoMenu } from "react-icons/io5";

const Header = ({
  toggleSidebar,
  showFilters,
  onFilterChange,
  admin,
  user,
}) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (admin) {
        navigate("/");
      }
    } catch (error) {
      console.log("Error logging out:", error.message);
    }
  };
  return (
    <header className="bg-slate-900 text-white px-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-sm md:text-2xl font-semibold py-3">
        <h1 className="mb-.5 capitalize">Welcome, {user || "User"}</h1>

        {showFilters && (
          <div className="flex-col md:flex-row space-x-2">
            <div className="text-[13px] font-semibold uppercase text-yellow-400 ms-2">
              <h2>Filter Tasks</h2>
            </div>
            <button
              onClick={() => onFilterChange("daily")}
              className="text-sm sm:text:xs font-medium py-1 px-2 my-1 sm:py-2 sm:px-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:bg-yellow-500 transition-all duration-300 ease-in-out"
            >
              Daily
            </button>
            <button
              onClick={() => onFilterChange("weekly")}
              className="text-sm sm:text:xs font-medium py-1 px-2 my-1 sm:py-2 sm:px-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:bg-yellow-500 transition-all duration-300 ease-in-out"
            >
              Weekly
            </button>
            <button
              onClick={() => onFilterChange("monthly")}
              className="text-sm font-medium py-1 px-2 my-1 sm:py-2 sm:px-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:bg-yellow-500 transition-all duration-300 ease-in-out"
            >
              Monthly
            </button>
            <br />
            <button
              onClick={() => onFilterChange("all")}
              className="text-xs font-medium my-1 text-blue-400 hover:underline uppercase"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col sm:flex-row">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center py-1 px-3 m-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300 ease-in-out"
        >
          <CiLogout />
          <span className="hidden sm:block">Logout</span>
        </button>
        <button
          className="flex items-center text-3xl md:hidden text-white m-2"
          onClick={toggleSidebar}
        >
          <IoMenu className="me-1" />
        </button>
      </div>
    </header>
  );
};

export default Header;
