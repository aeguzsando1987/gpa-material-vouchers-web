import apiClient from '../client';
import { User, UserUpdateInput } from '@/lib/types/user';

export const userService = {
  /**
   * Obtener lista de todos los usuarios
   * Endpoint: GET /users
   */
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Obtener usuario actual autenticado
   * Endpoint: GET /users/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  /**
   * Obtener lista de roles disponibles
   * Endpoint: GET /users/roles
   */
  getRoles: async (): Promise<Array<{ id: number; name: string; description: string }>> => {
    const response = await apiClient.get('/users/roles');
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   * Endpoint: GET /users/{user_id}
   */
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Actualizar un usuario existente
   * Endpoint: PUT /users/{user_id}
   */
  update: async (id: number, data: UserUpdateInput): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un usuario (soft delete)
   * Endpoint: DELETE /users/{user_id}
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Activar un usuario
   * Endpoint: PATCH /users/{user_id}/activate
   */
  activate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data;
  },

  /**
   * Desactivar un usuario
   * Endpoint: PATCH /users/{user_id}/deactivate
   */
  deactivate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response.data;
  },
};
