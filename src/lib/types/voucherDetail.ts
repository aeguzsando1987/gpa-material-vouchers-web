// Tipos para VoucherDetail (Líneas de detalle del vale)

export interface VoucherDetail {
  id: number;
  voucher_id: number;
  line_number: number; // 1-20
  product_id?: number;
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_of_measure: string;
  serial_number?: string;
  part_number?: string;
  notes?: string;

  // Validación línea por línea
  ok_exit?: boolean;
  ok_exit_notes?: string;
  ok_entry?: boolean;
  ok_entry_notes?: string;

  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

import { ProductCategory } from './product';

export interface VoucherDetailCreateInput {
  voucher_id: number;
  line_number: number; // 1-20
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_of_measure?: string; // Default: "PZA"
  serial_number?: string;
  part_number?: string;
  category?: ProductCategory; // Opcional - para auto-creación en cache
  notes?: string;

  // Validación línea por línea
  ok_exit?: boolean;
  ok_exit_notes?: string;
  ok_entry?: boolean;
  ok_entry_notes?: string;

  product_id?: number; // Opcional - si ya seleccionó de cache
}

export interface VoucherDetailUpdateInput {
  item_name?: string;
  item_description?: string;
  quantity?: number;
  unit_of_measure?: string;
  serial_number?: string;
  part_number?: string;
  notes?: string;

  // Validación línea por línea
  ok_exit?: boolean;
  ok_exit_notes?: string;
  ok_entry?: boolean;
  ok_entry_notes?: string;

  product_id?: number;
}

// Type para manejar detalles en el formulario (antes de guardar)
export interface VoucherDetailFormData {
  line_number: number;
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_of_measure: string;
  serial_number?: string;
  part_number?: string;
  notes?: string;

  // Validación línea por línea
  ok_exit?: boolean;
  ok_exit_notes?: string;
  ok_entry?: boolean;
  ok_entry_notes?: string;

  product_id?: number;
}

// Helpers
export const DEFAULT_UNIT_OF_MEASURE = 'PZA';
export const MAX_DETAIL_LINES = 20;

export const COMMON_UNITS = [
  { value: 'PZA', label: 'Pieza' },
  { value: 'KG', label: 'Kilogramo' },
  { value: 'MTS', label: 'Metro' },
  { value: 'LTS', label: 'Litro' },
  { value: 'CJA', label: 'Caja' },
  { value: 'PAQ', label: 'Paquete' },
  { value: 'JGO', label: 'Juego' },
  { value: 'LOT', label: 'Lote' },
];
