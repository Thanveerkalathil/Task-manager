import React from "react";

const Header = () => {
  return (
    <header className="bg-slate-700 text-white shadow-lg flex">
      <div className="container mx-auto px-4 py-4 flex justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold py-3">Task Manager Admin</div>
      </div>
    </header>
  );
};

export default Header;
