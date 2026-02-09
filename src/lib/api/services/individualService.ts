import apiClient from '../client';
import {
  Individual,
  IndividualWithUserInput,
  IndividualWithUserResponse,
  IndividualCreateInput,
  IndividualUpdateInput,
} from '@/lib/types/individual';

export const individualService = {
  /**
   * Obtener lista de todos los individuals con paginación
   * Endpoint: GET /individuals/
   */
  getAll: async (
    skip: number = 0,
    limit: number = 100,
    activeOnly: boolean = true
  ): Promise<Individual[]> => {
    const response = await apiClient.get<Individual[]>('/individuals/', {
      params: { skip, limit, active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Obtener individual por ID
   * Endpoint: GET /individuals/{id}
   */
  getById: async (id: number): Promise<Individual> => {
    const response = await apiClient.get<Individual>(`/individuals/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo individual
   * Endpoint: POST /individuals/
   */
  create: async (data: IndividualCreateInput): Promise<Individual> => {
    const response = await apiClient.post<Individual>('/individuals/', data);
    return response.data;
  },

  /**
   * Actualizar individual existente
   * Endpoint: PUT /individuals/{id}
   */
  update: async (id: number, data: IndividualUpdateInput): Promise<Individual> => {
    const response = await apiClient.put<Individual>(`/individuals/${id}`, data);
    return response.data;
  },

  /**
   * Crear individuo con usuario asociado (transacción atómica)
   * Endpoint: POST /individuals/with-user
   *
   * Este es el método recomendado para crear nuevos usuarios en el sistema,
   * ya que crea tanto el usuario como su perfil de individuo de manera atómica.
   */
  createWithUser: async (
    data: IndividualWithUserInput
  ): Promise<IndividualWithUserResponse> => {
    const response = await apiClient.post<IndividualWithUserResponse>(
      '/individuals/with-user',
      data
    );
    return response.data;
  },

  /**
   * Buscar individuals con filtros
   * Endpoint: GET /individuals/search
   */
  search: async (params: {
    user_id?: number;
    name?: string;
    last_name?: string;
    email?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Individual[]> => {
    const response = await apiClient.get<Individual[]>('/individuals/search', {
      params,
    });
    return response.data;
  },

  /**
   * Buscar individual por user_id (helper)
   * Retorna el primer individual asociado al user
   */
  getByUserId: async (userId: number): Promise<Individual | null> => {
    const results = await individualService.search({ user_id: userId, limit: 1 });
    return results.length > 0 ? results[0] : null;
  },
};
