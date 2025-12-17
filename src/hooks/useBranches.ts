import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/lib/api/services/branchService';
import {
  BranchCreateInput,
  BranchUpdateInput,
  BranchSearch,
} from '@/lib/types/branch';
import toast from 'react-hot-toast';

// Query keys
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (page?: number, perPage?: number, activeOnly?: boolean) =>
    [...branchKeys.lists(), { page, perPage, activeOnly }] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
  byCompany: (companyId: number) =>
    [...branchKeys.all, 'by-company', companyId] as const,
};

/**
 * Hook para obtener lista de sucursales con paginación
 */
export function useBranches(
  page: number = 1,
  perPage: number = 50,
  activeOnly: boolean = true
) {
  return useQuery({
    queryKey: branchKeys.list(page, perPage, activeOnly),
    queryFn: () => branchService.getAll(page, perPage, activeOnly),
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener una sucursal por ID
 */
export function useBranch(id: number) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => branchService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener sucursal con relaciones
 */
export function useBranchDetails(id: number) {
  return useQuery({
    queryKey: [...branchKeys.detail(id), 'details'],
    queryFn: () => branchService.getDetails(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener sucursales por empresa
 */
export function useBranchesByCompany(companyId: number) {
  return useQuery({
    queryKey: branchKeys.byCompany(companyId),
    queryFn: () => branchService.getByCompany(companyId),
    enabled: !!companyId,
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para crear una nueva sucursal
 */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BranchCreateInput) => branchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Sucursal creada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al crear sucursal';
      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar una sucursal
 */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BranchUpdateInput }) =>
      branchService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) });
      if (variables.data.company_id) {
        queryClient.invalidateQueries({
          queryKey: branchKeys.byCompany(variables.data.company_id),
        });
      }
      toast.success('Sucursal actualizada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al actualizar sucursal';
      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar una sucursal (soft delete)
 */
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Sucursal eliminada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al eliminar sucursal';
      toast.error(message);
    },
  });
}

/**
 * Hook para buscar sucursales
 */
export function useSearchBranches() {
  return useMutation({
    mutationFn: ({
      filters,
      page = 1,
      perPage = 50,
    }: {
      filters: BranchSearch;
      page?: number;
      perPage?: number;
    }) => branchService.search(filters, page, perPage),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al buscar sucursales';
      toast.error(message);
    },
  });
}

/**
 * Hook para activar una sucursal
 */
export function useActivateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      toast.success('Sucursal activada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al activar sucursal';
      toast.error(message);
    },
  });
}

/**
 * Hook para desactivar una sucursal
 */
export function useDeactivateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      toast.success('Sucursal desactivada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al desactivar sucursal';
      toast.error(message);
    },
  });
}
