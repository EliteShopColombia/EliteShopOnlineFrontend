/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

function getStoredUser() {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = async (data) => {
    const result = await authService.login(data);
    if (result.user) {
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  };

  const register = async (data) => {
    const result = await authService.register(data);
    if (result.user) {
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateToken = (authResponse) => {
    if (authResponse.token) {
      localStorage.setItem('token', authResponse.token);
    }
    if (authResponse.user) {
      setUser(authResponse.user);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, updateToken, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
