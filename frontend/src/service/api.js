import axios from "axios";

// Axios instance for frontend API requests
const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
