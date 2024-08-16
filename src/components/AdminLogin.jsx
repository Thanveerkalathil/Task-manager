import React from 'react';

const AdminLogin = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">Admin Login</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              required 
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Password" 
              required 
              className="w-full p-2 border border-gray-300 rounded"
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
