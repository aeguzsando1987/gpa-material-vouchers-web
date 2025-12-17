import apiClient from '../client';
import {
  Branch,
  BranchCreateInput,
  BranchUpdateInput,
  BranchListResponse,
  BranchSearch,
  BranchWithRelations,
} from '@/lib/types/branch';

export const branchService = {
  /**
   * Obtener lista de todas las sucursales con paginación
   * Endpoint: GET /branches/
   */
  getAll: async (
    page: number = 1,
    perPage: number = 50,
    activeOnly: boolean = true
  ): Promise<BranchListResponse> => {
    const response = await apiClient.get<BranchListResponse>('/branches/', {
      params: { page, per_page: perPage, active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Obtener una sucursal por ID
   * Endpoint: GET /branches/{branch_id}
   */
  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  /**
   * Obtener una sucursal por ID con relaciones cargadas
   * Endpoint: GET /branches/{branch_id}/details
   */
  getDetails: async (id: number): Promise<BranchWithRelations> => {
    const response = await apiClient.get<BranchWithRelations>(
      `/branches/${id}/details`
    );
    return response.data;
  },

  /**
   * Crear una nueva sucursal
   * Endpoint: POST /branches/
   */
  create: async (data: BranchCreateInput): Promise<Branch> => {
    const response = await apiClient.post<Branch>('/branches/', data);
    return response.data;
  },

  /**
   * Actualizar una sucursal existente
   * Endpoint: PUT /branches/{branch_id}
   */
  update: async (id: number, data: BranchUpdateInput): Promise<Branch> => {
    const response = await apiClient.put<Branch>(`/branches/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una sucursal (soft delete)
   * Endpoint: DELETE /branches/{branch_id}
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/branches/${id}`);
    return response.data;
  },

  /**
   * Buscar sucursales con filtros avanzados
   * Endpoint: POST /branches/search
   */
  search: async (
    filters: BranchSearch,
    page: number = 1,
    perPage: number = 50
  ): Promise<BranchListResponse> => {
    const response = await apiClient.post<BranchListResponse>(
      '/branches/search',
      filters,
      { params: { page, per_page: perPage } }
    );
    return response.data;
  },

  /**
   * Obtener sucursales por empresa
   * Endpoint: GET /branches/by-company/{company_id}
   */
  getByCompany: async (companyId: number): Promise<Branch[]> => {
    const response = await apiClient.get<Branch[]>(
      `/branches/by-company/${companyId}`
    );
    return response.data;
  },

  /**
   * Activar una sucursal
   * Endpoint: PATCH /branches/{branch_id}/activate
   */
  activate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/branches/${id}/activate`);
    return response.data;
  },

  /**
   * Desactivar una sucursal
   * Endpoint: PATCH /branches/{branch_id}/deactivate
   */
  deactivate: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.patch(`/branches/${id}/deactivate`);
    return response.data;
  },
};
