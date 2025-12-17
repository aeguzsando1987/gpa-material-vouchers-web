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

  create: async (data: VoucherDetailCreateInput): Promise<VoucherDetail> => {
    const response = await apiClient.post<VoucherDetail>('/voucher-details/', data);
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
