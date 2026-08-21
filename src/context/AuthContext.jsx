/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[AuthContext] Failed to parse JWT:', e);
    return null;
  }
};

function buildAuthState(token) {
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    token,
    userId: payload.sub,
    sellerId: payload.sellerId ?? null,
    role: payload.role ?? 'customer',
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
    dniType: payload.dniType,
    dniNumber: payload.dniNumber,
    address: payload.address,
    department: payload.department,
    city: payload.city,
  };
}

function persistAuth(authState) {
  if (!authState) return;
  localStorage.setItem('token', authState.token);
  if (authState.sellerId) localStorage.setItem('sellerId', authState.sellerId);
  else localStorage.removeItem('sellerId');
}

function getStoredAuth() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const authState = buildAuthState(token);
  if (!authState) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  return authState;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);

  const login = async (data) => {
    const result = await authService.login(data);
    if (result.token) {
      const newAuth = buildAuthState(result.token);
      if (newAuth) {
        setAuth(newAuth);
        persistAuth(newAuth);
      }
    }
    return result;
  };

  const register = async (data) => {
    const result = await authService.register(data);
    if (result.token) {
      const newAuth = buildAuthState(result.token);
      if (newAuth) {
        setAuth(newAuth);
        persistAuth(newAuth);
      }
    }
    return result;
  };

  const updateUser = (newData) => {
    setAuth((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      return updated;
    });
  };

  const updateToken = (authResponse) => {
    let updatedAuth = null;
    if (authResponse.token) {
      const newAuth = buildAuthState(authResponse.token);
      if (newAuth) {
        setAuth(newAuth);
        persistAuth(newAuth);
        updatedAuth = newAuth;
      }
    }
    if (authResponse.user) {
      setAuth((prev) => {
        if (!prev) return buildAuthState(authResponse.token);
        return { ...prev, ...authResponse.user };
      });
    }
    return updatedAuth;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sellerId');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, user: auth, login, register, logout, updateUser, updateToken, isAuthenticated: !!auth }}>
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
