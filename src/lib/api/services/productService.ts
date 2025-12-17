/**
 * Product Service
 * Servicio para interactuar con la API de productos
 */

import apiClient from '../client';
import { Product, ProductSearchResult, ProductListResponse, ProductCreatePayload, ProductUpdatePayload } from '@/lib/types/product';

/**
 * Busca productos por término (autocomplete)
 * @param searchTerm - Término de búsqueda (nombre o código)
 * @param limit - Máximo de resultados (default: 10)
 * @param activeOnly - Solo productos activos (default: true)
 * @returns Array de productos simplificados ordenados por uso
 */
export const search = async (
  searchTerm: string,
  limit: number = 10,
  activeOnly: boolean = true
): Promise<ProductSearchResult[]> => {
  const response = await apiClient.get<ProductSearchResult[]>('/products/search', {
    params: {
      q: searchTerm,
      limit,
      active_only: activeOnly,
    },
  });
  return response.data;
};

/**
 * Obtiene los productos más usados
 * @param limit - Número de productos a retornar (default: 20)
 * @param activeOnly - Solo productos activos (default: true)
 * @returns Array de productos ordenados por usage_count DESC
 */
export const getTopUsed = async (
  limit: number = 20,
  activeOnly: boolean = true
): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/products/top-used', {
    params: {
      limit,
      active_only: activeOnly,
    },
  });
  return response.data;
};

/**
 * Lista todos los productos con paginación
 * @param skip - Registros a saltar (default: 0)
 * @param limit - Máximo de registros (default: 100)
 * @param activeOnly - Solo productos activos (default: true)
 * @returns Array de productos
 */
export const getAll = async (
  skip: number = 0,
  limit: number = 100,
  activeOnly: boolean = true
): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/products/', {
    params: {
      skip,
      limit,
      active_only: activeOnly,
    },
  });
  return response.data;
};

/**
 * Lista productos con metadata de paginación
 * @param page - Número de página (default: 1)
 * @param perPage - Registros por página (default: 20)
 * @param orderBy - Campo para ordenar (default: 'usage_count')
 * @param orderDirection - Dirección de ordenamiento (default: 'desc')
 * @returns Objeto con productos y metadata de paginación
 */
export const getPaginated = async (
  page: number = 1,
  perPage: number = 20,
  orderBy: string = 'usage_count',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>('/products/paginated', {
    params: {
      page,
      per_page: perPage,
      order_by: orderBy,
      order_direction: orderDirection,
    },
  });
  return response.data;
};

/**
 * Obtiene un producto por ID
 * @param id - ID del producto
 * @returns Producto encontrado
 */
export const getById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

/**
 * Crea un nuevo producto
 * @param data - Datos del producto a crear
 * @returns Producto creado
 */
export const create = async (data: ProductCreatePayload): Promise<Product> => {
  const response = await apiClient.post<Product>('/products/', data);
  return response.data;
};

/**
 * Actualiza un producto existente
 * @param id - ID del producto
 * @param data - Datos a actualizar
 * @returns Producto actualizado
 */
export const update = async (id: number, data: ProductUpdatePayload): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, data);
  return response.data;
};

/**
 * Elimina un producto (soft delete por defecto)
 * @param id - ID del producto
 * @param hardDelete - Si true, borra físicamente (default: false)
 * @returns Mensaje de confirmación
 */
export const deleteProduct = async (id: number, hardDelete: boolean = false): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/products/${id}`, {
    params: {
      hard_delete: hardDelete,
    },
  });
  return response.data;
};

export const productService = {
  search,
  getTopUsed,
  getAll,
  getPaginated,
  getById,
  create,
  update,
  delete: deleteProduct,
};

export default productService;
