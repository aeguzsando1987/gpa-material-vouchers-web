import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/lib/api/services/companyService';
import {
  CompanyCreateInput,
  CompanyUpdateInput,
  CompanySearch,
} from '@/lib/types/company';
import toast from 'react-hot-toast';

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (page?: number, perPage?: number, activeOnly?: boolean) =>
    [...companyKeys.lists(), { page, perPage, activeOnly }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de empresas con paginación
 */
export function useCompanies(
  page: number = 1,
  perPage: number = 50,
  activeOnly: boolean = true
) {
  return useQuery({
    queryKey: companyKeys.list(page, perPage, activeOnly),
    queryFn: () => companyService.getAll(page, perPage, activeOnly),
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener una empresa por ID
 */
export function useCompany(id: number) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companyService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener empresa con relaciones
 */
export function useCompanyDetails(id: number) {
  return useQuery({
    queryKey: [...companyKeys.detail(id), 'details'],
    queryFn: () => companyService.getDetails(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear una nueva empresa
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyCreateInput) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success('Empresa creada exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de Pydantic (422)
      if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const validationErrors = error.response.data.detail;
        const errorMessages = validationErrors.map((err: any) => {
          const field = err.loc?.[err.loc.length - 1] || 'campo';
          return `${field}: ${err.msg}`;
        });
        toast.error(`Errores de validación:\n${errorMessages.join('\n')}`);
      } else {
        const message =
          error.response?.data?.detail || 'Error al crear empresa';
        toast.error(typeof message === 'string' ? message : 'Error al crear empresa');
      }
    },
  });
}

/**
 * Hook para actualizar una empresa
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyUpdateInput }) =>
      companyService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
      toast.success('Empresa actualizada exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de Pydantic (422)
      if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const validationErrors = error.response.data.detail;
        const errorMessages = validationErrors.map((err: any) => {
          const field = err.loc?.[err.loc.length - 1] || 'campo';
          return `${field}: ${err.msg}`;
        });
        toast.error(`Errores de validación:\n${errorMessages.join('\n')}`);
      } else {
        const message =
          error.response?.data?.detail || 'Error al actualizar empresa';
        toast.error(typeof message === 'string' ? message : 'Error al actualizar empresa');
      }
    },
  });
}

/**
 * Hook para eliminar una empresa (soft delete)
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => companyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success('Empresa eliminada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al eliminar empresa';
      toast.error(message);
    },
  });
}

/**
 * Hook para buscar empresas
 */
export function useSearchCompanies() {
  return useMutation({
    mutationFn: ({
      filters,
      page = 1,
      perPage = 50,
    }: {
      filters: CompanySearch;
      page?: number;
      perPage?: number;
    }) => companyService.search(filters, page, perPage),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al buscar empresas';
      toast.error(message);
    },
  });
}

/**
 * Hook para activar una empresa
 */
export function useActivateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => companyService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      toast.success('Empresa activada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al activar empresa';
      toast.error(message);
    },
  });
}

/**
 * Hook para desactivar una empresa
 */
export function useDeactivateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => companyService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      toast.success('Empresa desactivada exitosamente');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al desactivar empresa';
      toast.error(message);
    },
  });
}
