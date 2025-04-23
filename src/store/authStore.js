import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Dynamic API URL configuration
const getApiUrl = () => {
  const isEmulator = Constants.manifest?.debuggerHost;

  // Android emulator
  if (isEmulator && isEmulator.includes(":")) {
    return `http://0.0.0.0:8000/api/user/`;
  }

  // Physical device (replace with your computer's IP)
  return "http://192.168.0.107:8000/api/user";
};

const API_URL = getApiUrl();

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,

  // Initialize auth state from storage
  initializeAuth: async () => {
    try {
      const [token, user] = await Promise.all([
        SecureStore.getItemAsync("token"),
        AsyncStorage.getItem("userInfo"),
      ]);

      if (token && user) {
        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Initial auth load error:", error);
    }
  },

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null, message: null });
    try {
      console.log(`[Signup] Attempting with:`, { email, name }); // Debug log

      const response = await axios.post(
        `${API_URL}/signup`,
        {
          email,
          password,
          name,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("[Signup] Response:", response.data); // Debug log

      const token = response.headers.authorization.split(" ")[1];
      await SecureStore.setItemAsync("token", token);
      await AsyncStorage.setItem(
        "userInfo",
        JSON.stringify(response.data.user)
      );

      set({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
        message: "Signup successful!",
      });

      return true;
    } catch (error) {
      console.error("[Signup] Full error:", {
        message: error.message,
        response: error.response?.data,
        code: error.code,
      });

      let errorMsg = "Network error";
      if (error.response) {
        errorMsg =
          error.response.data?.message || JSON.stringify(error.response.data);
      } else if (error.message.includes("Network Error")) {
        errorMsg = "Cannot connect to server. Check your network.";
      }

      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Login function
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
        await SecureStore.setItemAsync("token", token);
      }
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials";
      set({
        error: errorMsg,
        isLoading: false,
      });
      throw new Error(errorMsg);
    }
  },

  // Logout function
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("token"),
      AsyncStorage.removeItem("userInfo"),
    ]);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Clear error messages
  clearError: () => set({ error: null }),

  // Clear success messages
  clearMessage: () => set({ message: null }),
}));
