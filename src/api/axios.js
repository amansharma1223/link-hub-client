import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://link-hub-4ufe.onrender.com/api",
});

// हर request के साथ token अपने-आप जुड़ जाए
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;