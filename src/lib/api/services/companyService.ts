import apiClient from '../client';
import {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
  CompanyListResponse,
  CompanySearch,
  CompanyWithRelations,
} from '@/lib/types/company';

export const companyService = {
  /**
   * Obtener lista de todas las empresas con paginación
   * Endpoint: GET /companies/
   */
  getAll: async (
    page: number = 1,
    perPage: number = 50,
    activeOnly: boolean = true
  ): Promise<CompanyListResponse> => {
    const response = await apiClient.get<CompanyListResponse>('/companies/', {
      params: { page, per_page: perPage, active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Obtener una empresa por ID
   * Endpoint: GET /companies/{company_id}
   */
  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return response.data;
  },

  /**
   * Obtener una empresa por ID con relaciones cargadas
   * Endpoint: GET /companies/{company_id}/details
   */
  getDetails: async (id: number): Promise<CompanyWithRelations> => {
    const response = await apiClient.get<CompanyWithRelations>(
      `/companies/${id}/details`
    );
    return response.data;
  },

  /**
   * Crear una nueva empresa
   * Endpoint: POST /companies/
   */
  create: async (data: CompanyCreateInput): Promise<Company> => {
    const response = await apiClient.post<Company>('/companies/', data);
    return response.data;
  },

  /**
   * Actualizar una empresa existente
   * Endpoint: PUT /companies/{company_id}
   */
  update: async (id: number, data: CompanyUpdateInput): Promise<Company> => {
    const response = await apiClient.put<Company>(`/companies/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una empresa (soft delete)
   * Endpoint: DELETE /companies/{company_id}
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  },

  /**
   * Buscar empresas con filtros avanzados
   * Endpoint: POST /companies/search
   */
  search: async (
    filters: CompanySearch,
    page: number = 1,
    perPage: number = 50
  ): Promise<CompanyListResponse> => {
    const response = await apiClient.post<CompanyListResponse>(
      '/companies/search',
      filters,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  },

  /**
   * Activar una empresa
   * Endpoint: PATCH /companies/{company_id}/activate
   */
  activate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/companies/${id}/activate`);
    return response.data;
  },

  /**
   * Desactivar una empresa
   * Endpoint: PATCH /companies/{company_id}/deactivate
   */
  deactivate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/companies/${id}/deactivate`);
    return response.data;
  },
};
