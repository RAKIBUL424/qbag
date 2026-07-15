
// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [userCoins, setUserCoins] = useState({
    total_coins: 0,
    breakdown: []
  });

  const API_BASE = "/api";

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}` 
    }
  }), []);

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
      setIsLoggedIn(true);
      
      // Fetch coins after successful auth
      await fetchUserCoins();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setUserCoins({ total_coins: 0, breakdown: [] });
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsLoggedIn(true);
    // Fetch coin balance after login
    await fetchUserCoins();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setUserCoins({ total_coins: 0, breakdown: [] });
  };

  const fetchUserCoins = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserCoins({ total_coins: 0, breakdown: [] });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/premium/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCoins(response.data || { total_coins: 0, breakdown: [] });
    } catch (error) {
      console.error("Error fetching coins:", error);
      setUserCoins({ total_coins: 0, breakdown: [] });
    }
  }, []);

  const updateCoins = (balance) => {
    setUserCoins((prev) => ({
      ...prev,
      total_coins: balance
    }));
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    userCoins,
    login,
    logout,
    updateCoins,
    fetchUserCoins,
    checkAuth,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};