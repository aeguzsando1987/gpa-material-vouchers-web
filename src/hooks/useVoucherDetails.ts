import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voucherDetailService } from '@/lib/api/services/voucherDetailService';
import {
  VoucherDetailCreateInput,
  VoucherDetailUpdateInput,
} from '@/lib/types/voucherDetail';
import toast from 'react-hot-toast';

// Query keys
export const voucherDetailKeys = {
  all: ['voucher-details'] as const,
  lists: () => [...voucherDetailKeys.all, 'list'] as const,
  byVoucher: (voucherId: number) =>
    [...voucherDetailKeys.all, 'by-voucher', voucherId] as const,
  details: () => [...voucherDetailKeys.all, 'detail'] as const,
  detail: (id: number) => [...voucherDetailKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los detalles de un voucher
 */
export function useVoucherDetails(voucherId: number) {
  return useQuery({
    queryKey: voucherDetailKeys.byVoucher(voucherId),
    queryFn: () => voucherDetailService.getByVoucherId(voucherId),
    enabled: !!voucherId,
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener un detalle por ID
 */
export function useVoucherDetail(id: number) {
  return useQuery({
    queryKey: voucherDetailKeys.detail(id),
    queryFn: () => voucherDetailService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear una nueva línea de detalle
 */
export function useCreateVoucherDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoucherDetailCreateInput) =>
      voucherDetailService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voucherDetailKeys.byVoucher(variables.voucher_id),
      });
      toast.success('Línea de detalle creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Error al crear línea de detalle'
      );
    },
  });
}

/**
 * Hook para actualizar una línea de detalle
 */
export function useUpdateVoucherDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      voucherId,
    }: {
      id: number;
      data: VoucherDetailUpdateInput;
      voucherId: number;
    }) => voucherDetailService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voucherDetailKeys.byVoucher(variables.voucherId),
      });
      queryClient.invalidateQueries({
        queryKey: voucherDetailKeys.detail(variables.id),
      });
      toast.success('Línea de detalle actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Error al actualizar línea de detalle'
      );
    },
  });
}

/**
 * Hook para eliminar una línea de detalle
 */
export function useDeleteVoucherDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, voucherId }: { id: number; voucherId: number }) =>
      voucherDetailService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voucherDetailKeys.byVoucher(variables.voucherId),
      });
      toast.success('Línea de detalle eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || 'Error al eliminar línea de detalle'
      );
    },
  });
}
