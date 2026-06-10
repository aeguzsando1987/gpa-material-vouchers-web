import apiClient from '../client';
import { IOManager, IOManagerCreateInput } from '@/lib/types/ioManager';

export const ioManagerService = {
  /**
   * Listar contralores activos
   * Endpoint: GET /io-managers/
   */
  getAll: async (): Promise<IOManager[]> => {
    const response = await apiClient.get<IOManager[]>('/io-managers/');
    return response.data;
  },

  /**
   * Registrar un contralor
   * Endpoint: POST /io-managers/
   */
  create: async (data: IOManagerCreateInput): Promise<IOManager> => {
    const response = await apiClient.post<IOManager>('/io-managers/', data);
    return response.data;
  },

  /**
   * Dar de baja un contralor
   * Endpoint: DELETE /io-managers/{id}
   */
  remove: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/io-managers/${id}`
    );
    return response.data;
  },
};
