// Frontend/src/context/AuthContext.jsx
// Drop-in auth state for the whole app — wraps Login, Register, ProfileDashboard

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, logout, googleAuth, register } from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until we've checked the session

  // ── On mount: silently re-hydrate from stored token ────
  useEffect(() => {
    const token = localStorage.getItem('luxe_access_token');
    if (!token) { setLoading(false); return; }

    api.get('/user/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('luxe_access_token'))
      .finally(() => setLoading(false));
  }, []);

  // ── Listen for session-expired event (from api.js interceptor) ──
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('luxe:session-expired', handler);
    return () => window.removeEventListener('luxe:session-expired', handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    const data = await login({ email, password });
    setUser(data.user);
    return data;
  }, []);

  const signInWithGoogle = useCallback(async (credential) => {
    const data = await googleAuth(credential);
    setUser(data.user);
    return data;
  }, []);

  const signUp = useCallback(async (formData) => {
    return register(formData); // user needs to verify email before logging in
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated,
      signIn, signInWithGoogle, signUp, signOut, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
