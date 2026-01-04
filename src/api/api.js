import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FULL_API_URL } from "../config/api";

// --------------------------------------------------
const API = axios.create({
  baseURL: FULL_API_URL,
  timeout: 15000,
});

// --------------------------------------------------
// 🔐 AUTH (🔥 FIXED: Capital 'Auth')
// --------------------------------------------------
export const signup = (data) =>
  API.post("/Auth/signup", data);

export const login = (phoneOrEmail, password) =>
  API.post("/Auth/login", { phoneOrEmail, password });

export const sendEmailOtp = (email) =>
  API.post("/Auth/send-email-otp", { email });

export const verifyEmailOtp = (email, code) =>
  API.post("/Auth/verify-email-otp", { email, code });

export const loginWithGoogle = (accessToken) =>
  API.post("/Auth/google", { accessToken });

export const signupWithGoogle = (accessToken) =>
  API.post("/Auth/google", { accessToken });

export const loginWithFacebook = (accessToken) =>
  API.post("/Auth/facebook", { accessToken });

export const signupWithFacebook = (accessToken) =>
  API.post("/Auth/facebook", { accessToken });

// --------------------------------------------------
// 👤 PROFILE
// --------------------------------------------------
export const getCurrentUser = () => API.get("/Auth/me");

export const updateProfile = (formData) =>
  API.put("/Auth/update-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateSettings = (data) =>
  API.put("/Auth/update-settings", data);

export const changePassword = (data) =>
  API.put("/Auth/change-password", data);

export const updatePrivacy = (data) =>
  API.put("/Auth/update-privacy", data);

export const updateLanguage = (data) =>
  API.put("/Auth/update-language", data);

// --------------------------------------------------
// 💰 LOYALTY & WALLET
// --------------------------------------------------
export const getMyPoints = () => API.get("/Loyalty/points");

// --------------------------------------------------
// 🆔 KYC
// --------------------------------------------------
export const getKycStatus = () => API.get("/kyc/status");

// --------------------------------------------------
// 🔑 AUTO TOKEN ATTACH
// --------------------------------------------------
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
