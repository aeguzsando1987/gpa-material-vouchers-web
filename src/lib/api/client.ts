import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Request Interceptor - Agregar JWT token a cada request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token de localStorage (solo en el cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Manejar errores globales
apiClient.interceptors.response.use(
  (response) => {
    // Retornar respuesta exitosa sin modificar
    return response;
  },
  (error: AxiosError) => {
    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401) {
      // Solo ejecutar en el cliente
      if (typeof window !== 'undefined') {
        // Limpiar token y redirigir a login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');

        // Redirigir a login si no estamos ya allí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Manejar error 403 (Permisos insuficientes)
    if (error.response?.status === 403) {
      console.error('Permisos insuficientes para esta acción');
    }

    // Manejar errores de red
    if (!error.response) {
      console.error('Error de conexión con el servidor');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
