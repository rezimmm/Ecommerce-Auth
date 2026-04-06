// Frontend/src/services/auth.service.js
// All auth API calls — maps directly to backend routes

import api from './api';

// ── Register ──────────────────────────────────────────────
// Matches Register.jsx form fields: firstName, lastName, email, phone, password
export const register = async ({ firstName, lastName, email, phone, password }) => {
  const { data } = await api.post('/auth/register', { firstName, lastName, email, phone, password });
  return data; // { success, message }
};

// ── Login ─────────────────────────────────────────────────
// Returns { success, accessToken, user }
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.accessToken) localStorage.setItem('luxe_access_token', data.accessToken);
  return data;
};

// ── Google OAuth ──────────────────────────────────────────
// Pass the credential string from Google Identity Services
export const googleAuth = async (credential) => {
  const { data } = await api.post('/auth/google', { credential });
  if (data.accessToken) localStorage.setItem('luxe_access_token', data.accessToken);
  return data;
};

// ── Logout ────────────────────────────────────────────────
export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('luxe_access_token');
};

// ── Email Verification ────────────────────────────────────
export const verifyEmail = async (token) => {
  const { data } = await api.get(`/auth/verify-email?token=${token}`);
  return data;
};

export const resendVerification = async (email) => {
  const { data } = await api.post('/auth/resend-verification', { email });
  return data;
};

// ── Forgot Password (Step 0) → sends OTP ─────────────────
export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

// ── Verify OTP (Step 1) ───────────────────────────────────
export const verifyOtp = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

// ── Reset Password (Step 2) ───────────────────────────────
export const resetPassword = async (email, password) => {
  const { data } = await api.post('/auth/reset-password', { email, password });
  return data;
};
