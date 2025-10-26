
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USERS } from '../data/mockData';

interface LoginModalProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.username === username);

    // In a real app, you'd check the password against a hash
    if (user && password === 'password') { 
      setError('');
      login(user);
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2 uppercase">Race Control Login</h2>
        <p className="text-center text-gray-400 mb-6">Enter credentials to access dashboard.</p>
        {error && <p className="bg-red-500/20 text-red-400 text-center p-2 rounded mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or steward"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Hint: Use 'password' for both users.</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
