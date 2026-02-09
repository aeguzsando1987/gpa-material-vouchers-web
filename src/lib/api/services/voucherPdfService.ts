import apiClient from '../client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const voucherPdfService = {
  /**
   * Inicia generación asíncrona de PDF para un voucher
   * @param voucherId - ID del voucher
   * @returns Promise con task_id y status inicial
   */
  generatePDF: async (voucherId: number) => {
    const response = await apiClient.post(`/vouchers/${voucherId}/generate-pdf`);
    return response.data; // { task_id, status, message }
  },

  /**
   * Consulta estado de tarea Celery
   * @param taskId - UUID de la tarea
   * @returns Promise con estado actual de la tarea
   */
  getTaskStatus: async (taskId: string) => {
    const response = await apiClient.get(`/vouchers/tasks/${taskId}/status`);
    return response.data; // { task_id, status, message, result }
  },

  /**
   * Obtiene URL de descarga del PDF (requiere autenticación)
   * @param voucherId - ID del voucher
   * @returns URL absoluta para descargar PDF
   */
  getDownloadUrl: (voucherId: number): string => {
    return `${API_URL}/vouchers/${voucherId}/download-pdf`;
  },

  /**
   * Descarga PDF directamente como blob
   * @param voucherId - ID del voucher
   * @returns Promise con blob del PDF
   */
  downloadPDF: async (voucherId: number): Promise<Blob> => {
    const response = await apiClient.get(`/vouchers/${voucherId}/download-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Obtiene metadata del PDF generado
   * @param voucherId - ID del voucher
   * @returns Promise con metadata (tamaño, fecha generación, etc.)
   */
  getMetadata: async (voucherId: number) => {
    const response = await apiClient.get(`/vouchers/${voucherId}/pdf-metadata`);
    return response.data;
  },
};
