import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL, timeout: 15000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, async (error:AxiosError) => {
  const config=error.config as (InternalAxiosRequestConfig & {_retry?:boolean})|undefined;
  if (error.response?.status === 401 && localStorage.getItem("refresh") && config && !config._retry && !config.url?.includes("auth/refresh")) {
    config._retry=true;
    try {
      const { data } = await axios.post<{access:string}>(`${baseURL}/auth/refresh/`, { refresh: localStorage.getItem("refresh") });
      localStorage.setItem("access", data.access);
      config.headers.Authorization = `Bearer ${data.access}`;
      return api(config);
    } catch { localStorage.removeItem("access");localStorage.removeItem("refresh");if(location.pathname!=="/login")location.assign("/login"); }
  }
  return Promise.reject(error);
});
export const errorMessage=(error:unknown)=>axios.isAxiosError(error)?String(error.response?.data&&typeof error.response.data==="object"?Object.values(error.response.data).flat().join(" "):error.message):"Something went wrong";
export default api;
