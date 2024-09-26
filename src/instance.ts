import axios, { AxiosInstance } from 'axios';
import encryptDecrypt from './function/encryptDecrypt';
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

  encryptDecrypt.decrypt(localStorage.getItem('accessToken') as string) ||
  encryptDecrypt.decrypt(sessionStorage.getItem('accessToken') as string);

axiosInstance.interceptors.request.use(async (config: any) => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default axiosInstance;
