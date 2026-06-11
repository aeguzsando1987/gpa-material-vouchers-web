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

  // 1. Aprobación de jefe directo (1er nivel)
  if (logsData.supervisor_approval) {
    rows.push({
      id: 0,
      log_type: 'supervisor_approval',
      status: 'APPROVED',
      responsible_name: logsData.supervisor_approval.approved_by_name || 'N/D',
      observations: logsData.supervisor_approval.approved_at ? '-' : 'Fecha no registrada',
      created_at: logsData.supervisor_approval.approved_at || '',
    });
  }

  // 2. Aprobación de contraloría (2do nivel)
  if (logsData.io_approval) {
    rows.push({
      id: 0,
      log_type: 'io_approval',
      status: 'APPROVED',
      responsible_name: logsData.io_approval.approved_by_name || 'N/D',
      observations: logsData.io_approval.approved_at ? '-' : 'Fecha no registrada',
      created_at: logsData.io_approval.approved_at || '',
    });
  }

  // 2b. Cancelación / rechazo. La capacidad se deriva del estado previo:
  //  PENDING -> rechazo jefe directo, PENDING_IO_APPROVAL -> rechazo contraloría,
  //  cualquier otro (APPROVED) -> cancelación.
  if (logsData.cancellation) {
    const c = logsData.cancellation;
    const cancelLogType: LogType =
      c.cancelled_from_status === 'PENDING'
        ? 'supervisor_rejection'
        : c.cancelled_from_status === 'PENDING_IO_APPROVAL'
        ? 'io_rejection'
        : 'cancellation';

    rows.push({
      id: 0,
      log_type: cancelLogType,
      status: 'CANCELLED',
      responsible_name: c.cancelled_by_name || 'N/D',
      observations: c.cancellation_reason || (c.cancelled_at ? '-' : 'Fecha no registrada'),
      created_at: c.cancelled_at || '',
    });
  }

  // 3. out_log (salida validada por vigilancia)
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

  // 4. entry_log (entrada/recepción)
  if (logsData.entry_log) {
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

  // Orden cronológico ascendente por fecha. Las filas sin fecha (aprobaciones
  // de vales históricos) quedan al inicio, que es su orden lógico.
  const toMs = (s: string) => {
    const t = s ? new Date(s).getTime() : 0;
    return Number.isNaN(t) ? 0 : t;
  };
  return rows.sort((a, b) => toMs(a.created_at) - toMs(b.created_at));
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
  if (status === 'REJECTED' || status === 'DAMAGED' || status === 'CANCELLED') {
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
  // Cancelaciones/rechazos: el estado del badge es CANCELLED
  if (status === 'CANCELLED') {
    return logType === 'supervisor_rejection' || logType === 'io_rejection'
      ? 'Rechazado'
      : 'Cancelado';
  }
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
  if (status === 'REJECTED' || status === 'DAMAGED' || status === 'INCOMPLETE' || status === 'OBSERVATION' || status === 'CANCELLED') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
  }

  // Fallback
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};
