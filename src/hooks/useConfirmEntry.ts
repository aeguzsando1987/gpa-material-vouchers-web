import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '@/lib/api/services/voucherService';
import { ConfirmEntryRequest } from '@/lib/types/voucher';
import { toast } from 'sonner';

interface UseConfirmEntryParams {
  voucherId: number;
  data: ConfirmEntryRequest;
}

export const useConfirmEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voucherId, data }: UseConfirmEntryParams) => {
      return voucherService.confirmEntry(voucherId, data);
    },

    onSuccess: (data) => {
      // Invalidar cache de vales
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher', data.id] });

      // Toasts diferenciados según resultado
      if (data.status === 'CLOSED') {
        toast.success('✅ Entrada confirmada - Vale cerrado exitosamente', {
          description: 'El material se recibió completo y en buen estado'
        });
      } else if (data.status === 'INCOMPLETE_DAMAGED') {
        toast.warning('⚠️ Entrada registrada con problemas', {
          description: 'El vale requiere seguimiento por material incompleto o dañado'
        });
      } else {
        toast.success('✅ Entrada confirmada', {
          description: `Vale actualizado a estado: ${data.status}`
        });
      }
    },

    onError: (error: any) => {
      // Mensajes de error más específicos según el código de estado
      let title = '❌ Error al confirmar entrada';
      let description = 'Intenta de nuevo';

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        switch (status) {
          case 400:
            title = '❌ Datos inválidos';
            description = detail || 'Verifica que todas las validaciones estén completas';
            break;
          case 404:
            title = '❌ Vale no encontrado';
            description = 'El vale que intentas confirmar no existe o fue eliminado';
            break;
          case 403:
            title = '❌ Sin permisos';
            description = 'No tienes autorización para confirmar entradas';
            break;
          case 409:
            title = '❌ Conflicto de estado';
            description = detail || 'El vale no está en un estado válido para confirmar entrada';
            break;
          case 500:
            title = '❌ Error del servidor';
            description = 'Ocurrió un problema en el servidor. Contacta al administrador';
            break;
          default:
            description = detail || 'Ocurrió un error inesperado';
        }
      } else if (error.request) {
        title = '❌ Error de conexión';
        description = 'No se pudo conectar con el servidor. Verifica tu conexión a internet';
      }

      toast.error(title, { description });
    }
  });
};
