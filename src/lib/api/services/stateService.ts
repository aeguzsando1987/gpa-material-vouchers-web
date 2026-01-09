import apiClient from '../client';
import { State } from '@/lib/types/state';

export const stateService = {
  /**
   * Obtener lista de todos los estados
   * Endpoint: GET /states/
   */
  getAll: async (
    skip: number = 0,
    limit: number = 1000,
    activeOnly: boolean = false
  ): Promise<State[]> => {
    const response = await apiClient.get<State[]>('/states/', {
      params: { skip, limit, active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Obtener un estado por ID
   * Endpoint: GET /states/{id}
   */
  getById: async (id: number): Promise<State> => {
    const response = await apiClient.get<State>(`/states/${id}`);
    return response.data;
  },

  /**
   * Obtener estados por país
   * Endpoint: GET /states/by-country/{country_id}
   */
  getByCountry: async (countryId: number): Promise<State[]> => {
    const response = await apiClient.get<State[]>(
      `/states/by-country/${countryId}`
    );
    return response.data;
  },

  /**
   * Buscar estados por nombre
   * Endpoint: GET /states/search/
   */
  search: async (query: string): Promise<State[]> => {
    const response = await apiClient.get<State[]>('/states/search/', {
      params: { q: query },
    });
    return response.data;
  },
};
