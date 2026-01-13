// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
});

// Set or remove token for all future requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Login API
export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { token, user }
};

export default api;
