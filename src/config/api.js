import axios from "axios";
import { toast } from 'react-toastify';

// Use localhost for development, fallback to production URL if needed
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request config:', {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added auth token to request');
    } else {
      console.log('No auth token found');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.groupEnd(); // Close the request group
    console.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    console.groupEnd();
    
    return response;
  },
  (error) => {
    console.groupEnd(); // Close the request group if it wasn't closed
    console.group('API Error');
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout:', error.message);
      toast.error('Request timed out. Please check your internet connection.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Handle specific error statuses
      if (error.response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.data?.message) {
        toast.error(error.response.data.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No Response Received:', error.request);
      toast.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Setup Error:', error.message);
      toast.error('Error setting up request. Please try again.');
    }
    
    console.groupEnd();
    return Promise.reject(error);
  }
);

export default api;