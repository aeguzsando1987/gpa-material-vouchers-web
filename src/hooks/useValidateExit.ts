import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { voucherService } from '@/lib/api/services/voucherService';
import { VoucherDetailedResponse } from '@/lib/types/voucher';

interface LineValidation {
  detail_id: number;
  ok: boolean;
  notes?: string;
}

interface ValidateExitPayload {
  voucher_id: number;
  scanned_by_id: number;
  line_validations: LineValidation[];
  general_observations?: string;
  qr_token?: string;
}

export const useValidateExit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<VoucherDetailedResponse, Error, ValidateExitPayload>({
    mutationFn: ({ voucher_id, qr_token, ...data }: ValidateExitPayload) =>
      voucherService.validateExit(voucher_id, data, qr_token),

    onSuccess: (response, variables) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher', variables.voucher_id] });

      // Mensaje de éxito según nuevo estado
      const newStatus = response.status;
      const allOk = variables.line_validations.every((v) => v.ok === true);

      if (newStatus === 'CLOSED') {
        toast.success(
          allOk
            ? 'Salida validada exitosamente. El vale se cerró automáticamente.'
            : 'Salida validada con observaciones. El vale se cerró automáticamente.',
          { duration: 5000 }
        );
      } else if (newStatus === 'IN_TRANSIT') {
        toast.success(
          allOk
            ? 'Salida validada exitosamente. El vale está en tránsito.'
            : 'Salida validada con observaciones. El vale está en tránsito.',
          { duration: 5000 }
        );
      }
    },

    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || 'Error al validar la salida del voucher';
      toast.error(errorMessage);
      console.error('Error validating exit:', error);
    },
  });

  return mutation;
};
