import apiClient from '../client';
import { Country } from '@/lib/types/country';

export const countryService = {
  /**
   * Obtener lista de todos los países
   * Endpoint: GET /countries/
   */
  getAll: async (
    skip: number = 0,
    limit: number = 100,
    activeOnly: boolean = false
  ): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/countries/', {
      params: { skip, limit, active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Obtener un país por ID
   * Endpoint: GET /countries/{id}
   */
  getById: async (id: number): Promise<Country> => {
    const response = await apiClient.get<Country>(`/countries/${id}`);
    return response.data;
  },

  /**
   * Obtener un país por código ISO
   * Endpoint: GET /countries/iso/{iso_code}
   */
  getByIso: async (isoCode: string): Promise<Country> => {
    const response = await apiClient.get<Country>(`/countries/iso/${isoCode}`);
    return response.data;
  },

  /**
   * Buscar países por nombre
   * Endpoint: GET /countries/search/
   */
  search: async (query: string): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/countries/search/', {
      params: { q: query },
    });
    return response.data;
  },
};
