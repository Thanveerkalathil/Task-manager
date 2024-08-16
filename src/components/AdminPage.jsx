import React, { useState } from 'react';
import Header from './Header';

const AddUserPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: 'defaultPassword' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.username && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ username: '', email: '', password: 'defaultPassword' });
      setError('');
    } else {
      setError('Username and Email are required.');
    }
  };

  return (
    <div>
        <div>
            <Header/>
        </div>
    <div className="flex justify-start items-start min-h-screen bg-gray-200 px-40 py-12">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-black">
        <h2 className="text-3xl font-semibold text-black mb-6">Add User</h2>
        <form onSubmit={handleAddUser}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-5">
            <label htmlFor="username" className="block text-lg font-medium text-black mb-2">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
              className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="email" className="block text-lg font-medium text-black mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              required
              className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddUserPage;
