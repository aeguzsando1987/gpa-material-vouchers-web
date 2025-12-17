import apiClient from '../client';
import {
  Voucher,
  VoucherWithDetails,
  VoucherCreateInput,
  VoucherUpdateInput,
  VoucherApprove,
  VoucherCancel,
  VoucherListResponse,
  VoucherSearchResponse,
  VoucherFilters,
  VoucherSearchParams,
  ValidateExitRequest,    // NUEVO
  ConfirmEntryRequest,    // NUEVO
} from '@/lib/types/voucher';

export const voucherService = {
  /**
   * Obtener lista de vouchers con paginación y filtros
   * Endpoint: GET /vouchers/
   */
  getAll: async (filters?: VoucherFilters): Promise<VoucherListResponse> => {
    const response = await apiClient.get<VoucherListResponse>('/vouchers/', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtener un voucher por ID
   * Endpoint: GET /vouchers/{voucher_id}
   */
  getById: async (
    id: number,
    options?: { detailed?: boolean; include_details?: boolean }
  ): Promise<VoucherWithDetails> => {
    const response = await apiClient.get<VoucherWithDetails>(`/vouchers/${id}`, {
      params: options,
    });
    return response.data;
  },

  /**
   * Obtener un voucher por folio
   * Endpoint: GET /vouchers/folio/{folio}
   */
  getByFolio: async (folio: string): Promise<Voucher> => {
    const response = await apiClient.get<Voucher>(`/vouchers/folio/${folio}`);
    return response.data;
  },

  /**
   * Búsqueda avanzada de vouchers
   * Endpoint: GET /vouchers/search/advanced
   * Retorna lista directa de vouchers filtrados
   */
  search: async (params: VoucherSearchParams): Promise<Voucher[]> => {
    const response = await apiClient.get<Voucher[]>('/vouchers/search/advanced', {
      params,
    });
    return response.data;
  },

  /**
   * Crear un nuevo voucher
   * Endpoint: POST /vouchers/
   */
  create: async (data: VoucherCreateInput): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>('/vouchers/', data);
    return response.data;
  },

  /**
   * Actualizar un voucher (solo si está en estado PENDING)
   * Endpoint: PUT /vouchers/{voucher_id}
   */
  update: async (id: number, data: VoucherUpdateInput): Promise<Voucher> => {
    const response = await apiClient.put<Voucher>(`/vouchers/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un voucher (soft delete)
   * Endpoint: DELETE /vouchers/{voucher_id}
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/vouchers/${id}`);
    return response.data;
  },

  /**
   * Aprobar un voucher
   * Endpoint: POST /vouchers/{voucher_id}/approve
   */
  approve: async (id: number, data?: VoucherApprove): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>(
      `/vouchers/${id}/approve`,
      data || {}
    );
    return response.data;
  },

  /**
   * Cancelar un voucher
   * Endpoint: POST /vouchers/{voucher_id}/cancel
   */
  cancel: async (id: number, data: VoucherCancel): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>(
      `/vouchers/${id}/cancel`,
      data
    );
    return response.data;
  },

  /**
   * Confirmar entrada de material (crea entry_log)
   * Endpoint: POST /vouchers/{voucher_id}/confirm-entry
   * LÓGICA ESTRICTA: Vale solo cierra si TODAS las líneas tienen ok=true
   */
  confirmEntry: async (
    id: number,
    data: ConfirmEntryRequest
  ): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>(
      `/vouchers/${id}/confirm-entry`,
      data
    );
    return response.data;
  },

  /**
   * Validar salida de material (crea out_log)
   * Endpoint: POST /vouchers/{voucher_id}/validate-exit
   * LÓGICA FLEXIBLE: Material SIEMPRE sale, incluso con observaciones
   */
  validateExit: async (
    id: number,
    data: ValidateExitRequest,
    qr_token?: string
  ): Promise<Voucher> => {
    const url = `/vouchers/${id}/validate-exit${qr_token ? `?qr_token=${qr_token}` : ''}`;
    const response = await apiClient.post<Voucher>(url, data);
    return response.data;
  },

  /**
   * Ver bitácora de logs del voucher
   * Endpoint: GET /vouchers/{voucher_id}/logs
   */
  getLogs: async (
    id: number
  ): Promise<{
    entry_log: any | null;
    out_log: any | null;
  }> => {
    const response = await apiClient.get(`/vouchers/${id}/logs`);
    return response.data;
  },

  /**
   * Generar PDF del voucher
   * Endpoint: POST /vouchers/{voucher_id}/generate-pdf
   */
  generatePdf: async (id: number): Promise<{ task_id: string }> => {
    const response = await apiClient.post(`/vouchers/${id}/generate-pdf`);
    return response.data;
  },

  /**
   * Validar código QR
   * Endpoint: POST /vouchers/validate-qr
   */
  validateQr: async (data: {
    qr_token: string;
    voucher_id?: number;
  }): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>('/vouchers/validate-qr', data);
    return response.data;
  },
};
