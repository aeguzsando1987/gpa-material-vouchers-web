import { useQuery } from '@tanstack/react-query';
import { countryService } from '@/lib/api/services/countryService';

// Query keys
export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (skip?: number, limit?: number, activeOnly?: boolean) =>
    [...countryKeys.lists(), { skip, limit, activeOnly }] as const,
  details: () => [...countryKeys.all, 'detail'] as const,
  detail: (id: number) => [...countryKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de países
 */
export function useCountries(
  skip: number = 0,
  limit: number = 100,
  activeOnly: boolean = false
) {
  return useQuery({
    queryKey: countryKeys.list(skip, limit, activeOnly),
    queryFn: () => countryService.getAll(skip, limit, activeOnly),
    staleTime: 300000, // 5 minutos (los países no cambian frecuentemente)
  });
}

/**
 * Hook para obtener un país por ID
 */
export function useCountry(id: number) {
  return useQuery({
    queryKey: countryKeys.detail(id),
    queryFn: () => countryService.getById(id),
    enabled: !!id,
  });
}
