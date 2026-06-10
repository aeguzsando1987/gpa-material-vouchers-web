import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '@/lib/api/services/voucherService';
import {
  VoucherCreateInput,
  VoucherUpdateInput,
  VoucherApprove,
  VoucherCancel,
  VoucherFilters,
  ValidateExitRequest,    // NUEVO
  ConfirmEntryRequest,    // NUEVO
} from '@/lib/types/voucher';
import toast from 'react-hot-toast';

// Query keys
export const voucherKeys = {
  all: ['vouchers'] as const,
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (filters?: VoucherFilters) => [...voucherKeys.lists(), filters] as const,
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (id: number) => [...voucherKeys.details(), id] as const,
  folio: (folio: string) => [...voucherKeys.all, 'folio', folio] as const,
  logs: (id: number) => [...voucherKeys.all, 'logs', id] as const,
};

/**
 * Hook para obtener lista de vouchers con paginación y filtros
 */
export function useVouchers(filters?: VoucherFilters) {
  return useQuery({
    queryKey: voucherKeys.list(filters),
    queryFn: () => voucherService.getAll(filters),
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener un voucher por ID
 */
export function useVoucher(id: number) {
  return useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: () => voucherService.getById(id, { detailed: true }),
    enabled: !!id,
  });
}

/**
 * Hook para obtener un voucher por folio
 */
export function useVoucherByFolio(folio: string) {
  return useQuery({
    queryKey: voucherKeys.folio(folio),
    queryFn: () => voucherService.getByFolio(folio),
    enabled: !!folio,
  });
}

/**
 * Hook para obtener los logs de un voucher
 */
export function useVoucherLogs(id: number) {
  return useQuery({
    queryKey: voucherKeys.logs(id),
    queryFn: () => voucherService.getLogs(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear un nuevo voucher
 */
export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoucherCreateInput) => voucherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Vale creado exitosamente');
    },
    onError: (error: any) => {
      let message = 'Error al crear vale';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        // Si es array (errores de validación Pydantic)
        if (Array.isArray(detail)) {
          message = detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        } else {
          message = JSON.stringify(detail);
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar un voucher
 */
export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VoucherUpdateInput }) =>
      voucherService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      toast.success('Vale actualizado exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de Pydantic (array de objetos)
      let message = 'Error al actualizar vale';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Si es un array de errores de validación (Pydantic)
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
        // Si es un string simple
        else if (typeof detail === 'string') {
          message = detail;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar un voucher (soft delete)
 */
export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => voucherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success('Vale eliminado exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al eliminar vale';
      toast.error(message);
    },
  });
}

/**
 * Hook para aprobar un voucher
 */
export function useApproveVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: VoucherApprove }) =>
      voucherService.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      toast.success('Vale aprobado exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de Pydantic (array de objetos)
      let message = 'Error al aprobar vale';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Si es un array de errores de validación (Pydantic)
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
        // Si es un string simple
        else if (typeof detail === 'string') {
          message = detail;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para la segunda aprobación (contraloría) de un voucher
 */
export function useApproveIOVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: VoucherApprove }) =>
      voucherService.approveIO(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      toast.success('Aprobación de contraloría registrada');
    },
    onError: (error: any) => {
      let message = 'Error en aprobación de contraloría';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        } else if (typeof detail === 'string') {
          message = detail;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para cancelar un voucher
 */
export function useCancelVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VoucherCancel }) =>
      voucherService.cancel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      toast.success('Vale cancelado exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de Pydantic (array de objetos)
      let message = 'Error al cancelar vale';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Si es un array de errores de validación (Pydantic)
        if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
        // Si es un string simple
        else if (typeof detail === 'string') {
          message = detail;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para confirmar entrada de material
 * LÓGICA ESTRICTA: Vale solo cierra si TODAS las líneas tienen ok=true
 */
export function useConfirmEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ConfirmEntryRequest;
    }) => voucherService.confirmEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: voucherKeys.logs(variables.id) });
      toast.success('Entrada confirmada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al confirmar entrada');
    },
  });
}

/**
 * Hook para validar salida de material
 * LÓGICA FLEXIBLE: Material SIEMPRE sale, incluso con observaciones
 */
export function useValidateExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ValidateExitRequest;
    }) => voucherService.validateExit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: voucherKeys.logs(variables.id) });
      toast.success('Salida validada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al validar salida');
    },
  });
}

/**
 * Hook para generar PDF de un voucher
 */
export function useGeneratePdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => voucherService.generatePdf(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(id) });
      toast.success('PDF generado exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al generar PDF';
      toast.error(message);
    },
  });
}

/**
 * Hook para validar código QR
 */
export function useValidateQr() {
  return useMutation({
    mutationFn: (data: { qr_token: string; voucher_id?: number }) =>
      voucherService.validateQr(data),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al validar código QR';
      toast.error(message);
    },
  });
}
