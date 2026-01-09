import { useQuery } from '@tanstack/react-query';
import { stateService } from '@/lib/api/services/stateService';

// Query keys
export const stateKeys = {
  all: ['states'] as const,
  lists: () => [...stateKeys.all, 'list'] as const,
  list: (skip?: number, limit?: number, activeOnly?: boolean) =>
    [...stateKeys.lists(), { skip, limit, activeOnly }] as const,
  byCountry: (countryId: number) => [...stateKeys.all, 'by-country', countryId] as const,
  details: () => [...stateKeys.all, 'detail'] as const,
  detail: (id: number) => [...stateKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de estados
 */
export function useStates(
  skip: number = 0,
  limit: number = 1000,
  activeOnly: boolean = false
) {
  return useQuery({
    queryKey: stateKeys.list(skip, limit, activeOnly),
    queryFn: () => stateService.getAll(skip, limit, activeOnly),
    staleTime: 300000, // 5 minutos (los estados no cambian frecuentemente)
  });
}

/**
 * Hook para obtener un estado por ID
 */
export function useState(id: number) {
  return useQuery({
    queryKey: stateKeys.detail(id),
    queryFn: () => stateService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener estados por país
 * Este es el más importante para el formulario de empresas
 */
export function useStatesByCountry(countryId: number | undefined) {
  return useQuery({
    queryKey: stateKeys.byCountry(countryId || 0),
    queryFn: () => stateService.getByCountry(countryId!),
    enabled: !!countryId, // Solo ejecuta si countryId está definido
    staleTime: 300000, // 5 minutos
  });
}
