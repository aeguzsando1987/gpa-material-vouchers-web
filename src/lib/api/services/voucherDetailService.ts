import apiClient from '../client';
import {
  VoucherDetail,
  VoucherDetailCreateInput,
  VoucherDetailUpdateInput,
} from '@/lib/types/voucherDetail';

export const voucherDetailService = {
  getByVoucherId: async (voucherId: number): Promise<VoucherDetail[]> => {
    const response = await apiClient.get<VoucherDetail[]>(`/voucher-details/voucher/${voucherId}`);
    return response.data;
  },

  getById: async (id: number): Promise<VoucherDetail> => {
    const response = await apiClient.get<VoucherDetail>(`/voucher-details/${id}`);
    return response.data;
  },

  /**
   * Crea una línea de detalle.
   *
   * El backend tiene un "flujo inteligente": si no se manda product_id, busca
   * productos similares por nombre y, si encuentra coincidencias, responde
   * ProductMatchesFound (HTTP 200) en lugar de crear la línea. En la captura por
   * tabla el usuario ya vio las coincidencias en el desplegable de la celda, así
   * que para líneas manuales (sin product_id) enviamos skip_similarity_search=true
   * para forzar la creación/auto-cacheo y evitar que la línea se pierda en silencio.
   */
  create: async (
    data: VoucherDetailCreateInput,
    opts?: { skipSimilaritySearch?: boolean }
  ): Promise<VoucherDetail> => {
    const response = await apiClient.post<VoucherDetail>('/voucher-details/', data, {
      params: opts?.skipSimilaritySearch ? { skip_similarity_search: true } : undefined,
    });
    return response.data;
  },

  update: async (id: number, data: VoucherDetailUpdateInput): Promise<VoucherDetail> => {
    const response = await apiClient.put<VoucherDetail>(`/voucher-details/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/voucher-details/${id}`);
    return response.data;
  },
};
