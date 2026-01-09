import { useQuery } from '@tanstack/react-query';
import { voucherService } from '@/lib/api/services/voucherService';
import { VoucherLogsResponse } from '@/lib/types/voucher';

/**
 * Hook para cargar logs de auditoría de un voucher
 * Solo debe usarse si el usuario tiene permisos (roles 1, 2, 3)
 *
 * @param voucherId - ID del voucher
 * @param enabled - Controlar si se ejecuta la query (basado en permisos)
 * @returns Query con los logs del voucher (entry_log y out_log)
 */
export const useVoucherLogs = (voucherId: number, enabled: boolean = true) => {
  return useQuery<VoucherLogsResponse, Error>({
    queryKey: ['voucher-logs', voucherId],
    queryFn: () => voucherService.getLogs(voucherId),
    enabled: enabled, // Controlar si se ejecuta la query
    staleTime: 30000, // 30 segundos de cache
    retry: 2, // 2 intentos en caso de error
  });
};
