import apiClient from '../client';
import { LoginCredentials, LoginResponse, User } from '@/lib/types/auth';
import { individualService } from './individualService';

export const authService = {
  /**
   * Login con email y password
   * Endpoint: POST /token
   * Formato OAuth2: application/x-www-form-urlencoded
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // OAuth2 requiere FormData con username (no email)
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // FastAPI usa 'username' para email
    formData.append('password', credentials.password);

    const response = await apiClient.post<LoginResponse>('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  },

  /**
   * Obtener datos del usuario actual
   * Endpoint: GET /users/me
   * Requiere: Authorization header (automático via interceptor)
   *
   * IMPORTANTE: También busca el Individual asociado al usuario
   * y agrega el individual_id al objeto User retornado
   */
  getCurrentUser: async (): Promise<User> => {
    // 1. Obtener datos básicos del usuario
    const response = await apiClient.get<User>('/users/me');
    const user = response.data;

    // 2. Buscar Individual asociado al usuario
    try {
      const individual = await individualService.getByUserId(user.id);

      // 3. Agregar individual_id al usuario si existe
      if (individual) {
        user.individual_id = individual.id;
      }
    } catch (error) {
      // Si falla la búsqueda de individual, continuar sin individual_id
      console.warn('No se pudo obtener Individual para user:', user.id, error);
    }

    return user;
  },

  /**
   * Logout (solo limpia localStorage)
   * No hay endpoint de logout en el backend (JWT stateless)
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
  },
};
