import React, { createContext, useState, useEffect } from 'react';

// Authentication context providing session state across the application
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authenticated user from localStorage on initial page load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('roommate_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
      localStorage.removeItem('roommate_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('roommate_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('roommate_user');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('roommate_user', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
