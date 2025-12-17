/**
 * Product Types
 * Tipos TypeScript para productos del cache
 */

export enum ProductCategory {
  TOOL = 'TOOL',
  MACHINE = 'MACHINE',
  COMPUTER_EQUIPMENT = 'COMPUTER_EQUIPMENT',
  FINISHED_PRODUCT = 'FINISHED_PRODUCT',
  RAW_MATERIAL = 'RAW_MATERIAL',
  SPARE_PART = 'SPARE_PART',
  CONSUMABLE = 'CONSUMABLE',
  OTHER = 'OTHER',
}

export interface Product {
  id: number;
  code: string | null;
  name: string;
  description: string | null;
  part_number: string | null;
  category: ProductCategory;
  unit_of_measure: string;
  is_serialized: boolean;
  usage_count: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
}

/**
 * Respuesta simplificada para búsqueda/autocomplete
 */
export interface ProductSearchResult {
  id: number;
  name: string;
  code: string | null;
  part_number: string | null;
  description: string | null;
  category: ProductCategory | null;
  unit_of_measure: string;
  usage_count: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductCreatePayload {
  code?: string;
  name: string;
  description?: string;
  part_number?: string;
  category?: ProductCategory;
  unit_of_measure?: string;
  is_serialized?: boolean;
}

export interface ProductUpdatePayload {
  code?: string;
  name?: string;
  description?: string;
  part_number?: string;
  category?: ProductCategory;
  unit_of_measure?: string;
  is_serialized?: boolean;
  is_active?: boolean;
}
