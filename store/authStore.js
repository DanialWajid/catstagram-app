import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8000/api/user";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });

      const authHeader = response.headers["authorization"];
      const token = authHeader?.split(" ")[1];
      const user = response.data.user;

      if (token) {
        await AsyncStorage.setItem("token", token);
      }
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const authHeader = response.headers["authorization"];
      const token = authHeader?.split(" ")[1];
      const user = response.data.user;

      if (token) {
        await AsyncStorage.setItem("token", token);
      }
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Invalid Email or Password",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = await AsyncStorage.getItem("token");
    const userStr = await AsyncStorage.getItem("userInfo");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({ user, token, isAuthenticated: true });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userInfo");

    set({ user: null, token: null, isAuthenticated: false });
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error sending reset email",
        isLoading: false,
      });
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error resetting password",
        isLoading: false,
      });
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      const user = response.data.user;
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_URL}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ message: "Password changed successfully", isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to change password",
        isLoading: false,
      });
    }
  },

  clearMessages: () => set({ error: null, message: null }),
}));
