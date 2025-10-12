import axios from "axios";
const BASE = "http://localhost:5050"
/**
 * adminApi - small helper that injects admin token from localStorage
 * Usage: import adminApi from '../utils/adminApi' ; adminApi.get('/admin/stats')
 */
const adminApi = axios.create({
  baseURL: BASE,
  timeout: 15000,
});
// attach token automatically
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token"); // admin token key
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default adminApi;


