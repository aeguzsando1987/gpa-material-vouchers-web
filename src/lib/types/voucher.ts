// Tipos para Vouchers (Vales)

import { VoucherDetail } from './voucherDetail';

// Re-exportar VoucherDetail para que esté disponible
export type { VoucherDetail } from './voucherDetail';

// Enums
export type VoucherType = 'ENTRY' | 'EXIT';
export type VoucherStatus =
  | 'PENDING'
  | 'PENDING_IO_APPROVAL' // 1ª aprobación dada, pendiente de contraloría
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
  io_approved_by_id?: number; // 2ª aprobación (contraloría)
  received_by_id?: number;
  with_return: boolean;
  is_intercompany: boolean;
  estimated_return_date?: string; // ISO date
  actual_return_date?: string; // ISO date
  first_approved_at?: string; // ISO datetime (1ª aprobación)
  io_approved_at?: string; // ISO datetime (2ª aprobación)
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
  io_approved_by_name?: string;
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
  order_by?: string; // Campo para ordenar (folio, created_at, etc.)
  order_direction?: 'asc' | 'desc'; // Dirección del ordenamiento
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
  PENDING_IO_APPROVAL: 'Pend. Contraloría',
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

// Estados en los que el vale ya pasó la doble aprobación (jefe directo + contraloría)
// y por tanto puede imprimirse. Se excluyen PENDING, PENDING_IO_APPROVAL y CANCELLED.
export const PRINTABLE_VOUCHER_STATUSES: VoucherStatus[] = [
  'APPROVED',
  'IN_TRANSIT',
  'OVERDUE',
  'CLOSED',
  'INCOMPLETE_DAMAGED',
];

export const isVoucherPrintable = (status: VoucherStatus): boolean =>
  PRINTABLE_VOUCHER_STATUSES.includes(status);

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

// ==================== LOG TYPES (Audit Trail) ====================

// Enums para estados de logs
export type EntryStatus = 'COMPLETE' | 'INCOMPLETE' | 'DAMAGED';
export type ValidationStatus = 'APPROVED' | 'REJECTED' | 'OBSERVATION';
export type LogType = 'entry_log' | 'out_log';

// Entry Log (Registro de Entrada)
export interface EntryLog {
  id: number;
  voucher_id: number;
  entry_status: EntryStatus;
  receiver_id: number;
  received_by_name: string;
  missing_items_description?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  created_by?: number;
}

// Out Log (Registro de Salida)
export interface OutLog {
  id: number;
  voucher_id: number;
  validation_status: ValidationStatus;
  scanned_by_id: number;
  scanned_by_name: string;
  observations?: string;
  gps_location?: string;
  is_active: boolean;
  created_at: string;
  created_by?: number;
}

// Respuesta del endpoint getLogs
export interface VoucherLogsResponse {
  voucher_id: number;
  folio: string;
  entry_log: EntryLog | null;
  out_log: OutLog | null;
}

// Tipo unificado para renderizar en tabla
export interface LogTableRow {
  id: number;
  log_type: LogType;
  status: EntryStatus | ValidationStatus;
  responsible_name: string;
  observations: string;
  created_at: string;
}

// Mapeos en español
export const ENTRY_STATUS_NAMES: Record<EntryStatus, string> = {
  COMPLETE: 'Completo',
  INCOMPLETE: 'Incompleto',
  DAMAGED: 'Dañado',
};

export const VALIDATION_STATUS_NAMES: Record<ValidationStatus, string> = {
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  OBSERVATION: 'Con Observaciones',
};

export const LOG_TYPE_NAMES: Record<LogType, string> = {
  entry_log: 'Entrada de Material',
  out_log: 'Validación de Salida',
};

// Helpers
export const getEntryStatusName = (status: EntryStatus): string =>
  ENTRY_STATUS_NAMES[status] || status;

export const getValidationStatusName = (status: ValidationStatus): string =>
  VALIDATION_STATUS_NAMES[status] || status;

export const getLogTypeName = (type: LogType): string => LOG_TYPE_NAMES[type] || type;
