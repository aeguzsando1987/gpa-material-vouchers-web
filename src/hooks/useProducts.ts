/**
 * useProducts Hook
 * React Query hooks para gestión de productos
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import productService from '@/lib/api/services/productService';
import { Product, ProductSearchResult, ProductListResponse, ProductCreatePayload, ProductUpdatePayload } from '@/lib/types/product';

/**
 * Hook para buscar productos (autocomplete)
 * @param searchTerm - Término de búsqueda
 * @param limit - Máximo de resultados (default: 10)
 * @param enabled - Si la query está habilitada (default: true si hay searchTerm)
 */
export const useProductSearch = (
  searchTerm: string,
  limit: number = 10,
  enabled: boolean = true
): UseQueryResult<ProductSearchResult[], Error> => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm, limit],
    queryFn: () => productService.search(searchTerm, limit),
    enabled: enabled && searchTerm.length >= 2, // Mínimo 2 caracteres para buscar
    staleTime: 30000, // 30 segundos
  });
};

/**
 * Hook para obtener productos más usados
 * @param limit - Número de productos (default: 20)
 */
export const useTopProducts = (limit: number = 20): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', 'top-used', limit],
    queryFn: () => productService.getTopUsed(limit),
    staleTime: 60000, // 1 minuto
  });
};

/**
 * Hook para listar todos los productos
 * @param skip - Registros a saltar (default: 0)
 * @param limit - Máximo de registros (default: 100)
 * @param activeOnly - Solo productos activos (default: true)
 */
export const useProducts = (
  skip: number = 0,
  limit: number = 100,
  activeOnly: boolean = true
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: ['products', 'list', skip, limit, activeOnly],
    queryFn: () => productService.getAll(skip, limit, activeOnly),
    staleTime: 60000, // 1 minuto
  });
};

/**
 * Hook para obtener productos con paginación
 * @param page - Número de página (default: 1)
 * @param perPage - Registros por página (default: 20)
 * @param orderBy - Campo para ordenar (default: 'usage_count')
 * @param orderDirection - Dirección de ordenamiento (default: 'desc')
 */
export const useProductsPaginated = (
  page: number = 1,
  perPage: number = 20,
  orderBy: string = 'usage_count',
  orderDirection: 'asc' | 'desc' = 'desc'
): UseQueryResult<ProductListResponse, Error> => {
  return useQuery({
    queryKey: ['products', 'paginated', page, perPage, orderBy, orderDirection],
    queryFn: () => productService.getPaginated(page, perPage, orderBy, orderDirection),
    staleTime: 60000, // 1 minuto
  });
};

/**
 * Hook para obtener un producto por ID
 * @param id - ID del producto
 * @param enabled - Si la query está habilitada (default: true)
 */
export const useProduct = (id: number, enabled: boolean = true): UseQueryResult<Product, Error> => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getById(id),
    enabled: enabled && id > 0,
    staleTime: 300000, // 5 minutos
  });
};

/**
 * Hook para crear un producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, ProductCreatePayload>({
    mutationFn: (data: ProductCreatePayload) => productService.create(data),

    onSuccess: (newProduct) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Producto creado: ${newProduct.name}`);
    },

    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al crear el producto';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Error al crear producto');
      console.error('Error creating product:', error);
    },
  });
};

/**
 * Hook para actualizar un producto
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: number; data: ProductUpdatePayload }>({
    mutationFn: ({ id, data }) => productService.update(id, data),

    onSuccess: (updatedProduct) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', updatedProduct.id] });
      toast.success(`Producto actualizado: ${updatedProduct.name}`);
    },

    onError: (error: any) => {
      // Manejar errores de validación Pydantic (422)
      if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const validationErrors = error.response.data.detail;
        const errorMessages = validationErrors.map((err: any) => {
          const field = err.loc?.[err.loc.length - 1] || 'campo';
          return `${field}: ${err.msg}`;
        });
        toast.error(`Errores de validación:\n${errorMessages.join('\n')}`);
      } else {
        const errorMessage = error.response?.data?.detail || 'Error al actualizar el producto';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Error al actualizar producto');
      }
      console.error('Error updating product:', error);
    },
  });
};

/**
 * Hook para eliminar un producto
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number; hardDelete?: boolean }>({
    mutationFn: ({ id, hardDelete = false }) => productService.delete(id, hardDelete),

    onSuccess: (_, variables) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        variables.hardDelete ? 'Producto eliminado permanentemente' : 'Producto eliminado exitosamente'
      );
    },

    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar el producto';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Error al eliminar producto');
      console.error('Error deleting product:', error);
    },
  });
};
