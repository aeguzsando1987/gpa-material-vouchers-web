// Tipos para Vouchers (Vales)

import { VoucherDetail } from './voucherDetail';

// Enums
export type VoucherType = 'ENTRY' | 'EXIT';
export type VoucherStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'IN_TRANSIT'
  | 'OVERDUE'
  | 'CLOSED'
  | 'CANCELLED'
  | 'INCOMPLETE_DAMAGED'; // NUEVO

// Interfaces principales
export interface Voucher {
  id: number;
  folio: string;
  voucher_type: VoucherType;
  status: VoucherStatus;
  company_id: number;
  origin_branch_id?: number;
  destination_branch_id?: number;
  outer_destination?: string; // NUEVO
  delivered_by_id: number;
  approved_by_id?: number;
  received_by_id?: number;
  with_return: boolean;
  is_intercompany: boolean;
  estimated_return_date?: string; // ISO date
  actual_return_date?: string; // ISO date
  notes?: string;
  internal_notes?: string;
  qr_token?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

// Voucher con detalles (cuando se incluyen las líneas)
export interface VoucherWithDetails extends Voucher {
  details?: VoucherDetail[];
  company_name?: string;
  origin_branch_name?: string;
  destination_branch_name?: string;
  delivered_by_name?: string;
  approved_by_name?: string;
  received_by_name?: string;
}

export interface VoucherCreateInput {
  voucher_type: VoucherType;
  company_id: number;
  origin_branch_id?: number;
  destination_branch_id?: number;
  outer_destination?: string; // NUEVO
  delivered_by_id: number;
  with_return: boolean;
  is_intercompany: boolean;
  estimated_return_date?: string; // ISO date (YYYY-MM-DD)
  notes?: string;
  internal_notes?: string;
}

export interface VoucherUpdateInput {
  origin_branch_id?: number;
  destination_branch_id?: number;
  outer_destination?: string; // NUEVO
  with_return?: boolean;
  is_intercompany?: boolean;
  estimated_return_date?: string;
  actual_return_date?: string;
  notes?: string;
  internal_notes?: string;
}

export interface VoucherApprove {
  approved_by_id?: number;
  notes?: string;
}

export interface VoucherCancel {
  cancellation_reason: string;
}

// Response types
export interface VoucherListResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface VoucherSearchResponse {
  vouchers: Voucher[];
  total: number;
  limit: number;
}

// Filtros de búsqueda
export interface VoucherFilters {
  voucher_type?: VoucherType;
  status?: VoucherStatus;
  company_id?: number;
  with_return?: boolean; // Filtro para tipo de salida (con/sin retorno)
  search?: string; // Buscar por folio
  skip?: number;
  limit?: number;
  page?: number;
  per_page?: number;
  active_only?: boolean;
}

// Parámetros de búsqueda avanzada
export interface VoucherSearchParams {
  search_term?: string; // Buscar en folio o notas
  company_id?: number;
  status?: VoucherStatus;
  voucher_type?: VoucherType;
  from_date?: string; // ISO date
  to_date?: string; // ISO date
  limit?: number;
}

// Helpers
export const VOUCHER_TYPE_NAMES: Record<VoucherType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
};

export const VOUCHER_STATUS_NAMES: Record<VoucherStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  IN_TRANSIT: 'En Tránsito',
  OVERDUE: 'Vencido',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
  INCOMPLETE_DAMAGED: 'Incompleto/Dañado', // NUEVO
};

export const getVoucherTypeName = (type: VoucherType): string => {
  return VOUCHER_TYPE_NAMES[type] || type;
};

export const getVoucherStatusName = (status: VoucherStatus): string => {
  return VOUCHER_STATUS_NAMES[status] || status;
};

// ==================== LINE-BY-LINE VALIDATION TYPES ====================

export interface LineValidation {
  detail_id: number;
  ok: boolean;
  notes?: string;
}

export interface ValidateExitRequest {
  scanned_by_id: number;
  line_validations: LineValidation[];
  general_observations?: string;
}

export interface ConfirmEntryRequest {
  received_by_id: number;
  line_validations: LineValidation[];
  general_observations?: string;
}
