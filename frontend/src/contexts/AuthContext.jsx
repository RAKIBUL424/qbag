


// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);

  const API_BASE = "http://127.0.0.1:8000";

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user info from backend
      const response = await axios.get(`${API_BASE}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setCoinBalance(response.data.coins || 0);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setCoinBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsLoggedIn(true);
    // Fetch coin balance
    fetchCoinBalance();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setCoinBalance(0);
  };

  const fetchCoinBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/premium/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoinBalance(response.data.coins || 0);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };

  const updateCoins = (balance) => {
    setCoinBalance(balance);
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    coinBalance,
    login,
    logout,
    updateCoins,
    fetchCoinBalance,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};