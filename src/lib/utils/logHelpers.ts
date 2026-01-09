import {
  VoucherLogsResponse,
  LogTableRow,
  ENTRY_STATUS_NAMES,
  VALIDATION_STATUS_NAMES,
  EntryStatus,
  ValidationStatus,
  LogType,
} from '@/lib/types/voucher';

/**
 * Transforma la respuesta de logs en filas para renderizar en tabla
 * Orden: out_log primero (salida), entry_log después (entrada)
 *
 * @param logsData - Respuesta del endpoint getLogs
 * @returns Array de filas para renderizar en tabla
 */
export const transformLogsToTableRows = (
  logsData: VoucherLogsResponse
): LogTableRow[] => {
  const rows: LogTableRow[] = [];

  // 1. Agregar out_log (salida) PRIMERO si existe
  if (logsData.out_log) {
    rows.push({
      id: logsData.out_log.id,
      log_type: 'out_log',
      status: logsData.out_log.validation_status,
      responsible_name: logsData.out_log.scanned_by_name,
      observations: logsData.out_log.observations || '-',
      created_at: logsData.out_log.created_at,
    });
  }

  // 2. Agregar entry_log (entrada) DESPUÉS si existe
  if (logsData.entry_log) {
    // Combinar notas y missing_items en observaciones
    const observations: string[] = [];
    if (logsData.entry_log.notes) {
      observations.push(logsData.entry_log.notes);
    }
    if (logsData.entry_log.missing_items_description) {
      observations.push(`Faltantes: ${logsData.entry_log.missing_items_description}`);
    }

    rows.push({
      id: logsData.entry_log.id,
      log_type: 'entry_log',
      status: logsData.entry_log.entry_status,
      responsible_name: logsData.entry_log.received_by_name,
      observations: observations.length > 0 ? observations.join(' | ') : '-',
      created_at: logsData.entry_log.created_at,
    });
  }

  return rows;
};

/**
 * Determina la variante del Badge según el estado del log
 *
 * @param status - Estado del log (APPROVED, COMPLETE, REJECTED, DAMAGED, etc.)
 * @returns Variante del badge para aplicar color correcto
 */
export const getStatusBadgeVariant = (
  status: EntryStatus | ValidationStatus | string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  // Estados positivos (verde/default)
  if (status === 'APPROVED' || status === 'COMPLETE') {
    return 'default';
  }

  // Estados negativos (rojo/destructive)
  if (status === 'REJECTED' || status === 'DAMAGED') {
    return 'destructive';
  }

  // Estados intermedios (amarillo/secondary)
  if (status === 'INCOMPLETE' || status === 'OBSERVATION') {
    return 'secondary';
  }

  return 'outline'; // Fallback para estados desconocidos
};

/**
 * Obtiene el nombre en español del estado según el tipo de log
 *
 * @param status - Estado del log
 * @param logType - Tipo de log (entry_log o out_log)
 * @returns Nombre del estado en español
 */
export const getStatusDisplayName = (
  status: EntryStatus | ValidationStatus | string,
  logType: LogType
): string => {
  if (logType === 'entry_log') {
    return ENTRY_STATUS_NAMES[status as EntryStatus] || status;
  } else {
    return VALIDATION_STATUS_NAMES[status as ValidationStatus] || status;
  }
};

/**
 * Obtiene las clases de color Tailwind para el badge según el estado
 * Verde para OK (APPROVED, COMPLETE)
 * Rojo para NO OK (REJECTED, DAMAGED, INCOMPLETE, OBSERVATION)
 *
 * @param status - Estado del log
 * @returns Clases de Tailwind para el badge
 */
export const getBadgeColorClasses = (
  status: EntryStatus | ValidationStatus | string
): string => {
  // Estados OK (verde)
  if (status === 'APPROVED' || status === 'COMPLETE') {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
  }

  // Estados NO OK (rojo)
  if (status === 'REJECTED' || status === 'DAMAGED' || status === 'INCOMPLETE' || status === 'OBSERVATION') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
  }

  // Fallback
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};
