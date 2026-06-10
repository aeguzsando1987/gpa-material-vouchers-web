import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ioManagerService } from '@/lib/api/services/ioManagerService';
import toast from 'react-hot-toast';

// Query keys
export const ioManagerKeys = {
  all: ['io-managers'] as const,
  lists: () => [...ioManagerKeys.all, 'list'] as const,
};

/**
 * Hook para listar contralores (io managers) activos
 */
export function useIOManagers() {
  return useQuery({
    queryKey: ioManagerKeys.lists(),
    queryFn: () => ioManagerService.getAll(),
    staleTime: 30000,
  });
}

function extractError(error: any, fallback: string): string {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      return detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
    }
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}

/**
 * Hook para registrar un contralor
 */
export function useAddIOManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (individual_id: number) => ioManagerService.create({ individual_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ioManagerKeys.lists() });
      toast.success('Contralor registrado');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Error al registrar contralor'));
    },
  });
}

/**
 * Hook para dar de baja un contralor
 */
export function useRemoveIOManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ioManagerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ioManagerKeys.lists() });
      toast.success('Contralor dado de baja');
    },
    onError: (error: any) => {
      toast.error(extractError(error, 'Error al dar de baja contralor'));
    },
  });
}
