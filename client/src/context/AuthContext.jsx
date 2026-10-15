import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tastybite_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tastybite_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tastybite_token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('tastybite_token');
      localStorage.removeItem('tastybite_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('tastybite_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Profile fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('tastybite_token', res.data.token);
      localStorage.setItem('tastybite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await API.post('/auth/google', googleData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('tastybite_token', res.data.token);
      localStorage.setItem('tastybite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('tastybite_token', res.data.token);
      localStorage.setItem('tastybite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tastybite_token');
    localStorage.removeItem('tastybite_user');
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('tastybite_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const addAddress = async (addressData) => {
    const res = await API.post('/auth/addresses', addressData);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const deleteAddress = async (id) => {
    const res = await API.delete(`/auth/addresses/${id}`);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const toggleWishlist = async (foodId) => {
    if (!token) return { success: false, message: 'Please login first' };
    const res = await API.post(`/auth/wishlist/${foodId}`);
    if (res.data.success) {
      setUser(prev => ({ ...prev, wishlist: res.data.wishlist }));
    }
    return res.data;
  };

  const updateAddress = async (id, addressData) => {
    const res = await API.put(`/auth/addresses/${id}`, addressData);
    if (res.data.success) {
      setUser(prev => ({ ...prev, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await API.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  const isWishlisted = (foodId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some(item => (typeof item === 'string' ? item : item._id) === foodId);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    changePassword,
    toggleWishlist,
    isWishlisted,
    refreshProfile: fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
