import axios from 'axios';

// Central axios instance pre-configured with the Spring Boot backend base URL
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor to attach the X-User-Id header dynamically from localStorage for authenticated requests
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('roommate_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) {
          config.headers['X-User-Id'] = user.id;
        }
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standard error message extractor for consistent user-friendly error alerts
export const getErrorMessage = (err) => {
  return err.response?.data?.message || 'Cannot reach server';
};

export default api;
