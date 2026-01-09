import { useQuery } from '@tanstack/react-query';
import { individualService } from '@/lib/api/services/individualService';

/**
 * Hook para obtener lista de individuals (para selects de Manager, etc.)
 */
export function useIndividuals(
  skip: number = 0,
  limit: number = 100,
  activeOnly: boolean = true
) {
  return useQuery({
    queryKey: ['individuals', skip, limit, activeOnly],
    queryFn: () => individualService.getAll(skip, limit, activeOnly),
    staleTime: 300000, // 5 minutos
  });
}
