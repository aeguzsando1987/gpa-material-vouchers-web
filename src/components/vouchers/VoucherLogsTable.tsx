'use client';

import { useState } from 'react';
import { Loader2, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVoucherLogs } from '@/hooks/useVoucherLogs';
import { useAuthStore } from '@/lib/store/authStore';
import {
  transformLogsToTableRows,
  getStatusDisplayName,
  getBadgeColorClasses,
} from '@/lib/utils/logHelpers';
import { getLogTypeName, LogTableRow } from '@/lib/types/voucher';
import { formatLogDate } from '@/lib/utils/dateHelpers';

interface VoucherLogsTableProps {
  voucherId: number;
}

/**
 * Componente que muestra el historial de transacciones (logs) de un voucher
 * Solo visible para roles: 1 (Admin), 2 (Manager), 3 (Supervisor)
 *
 * Muestra en una tabla los registros de:
 * - out_log: Validación de salida (escaneado por vigilante)
 * - entry_log: Confirmación de entrada (recibido por gerente/supervisor)
 *
 * @param voucherId - ID del voucher a consultar
 */
export default function VoucherLogsTable({ voucherId }: VoucherLogsTableProps) {
  const { user } = useAuthStore();

  // Estado para controlar el modal de observaciones
  const [selectedLog, setSelectedLog] = useState<LogTableRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Control de permisos: Solo Admin (1), Manager (2), Supervisor (3)
  const hasPermission = user && [1, 2, 3].includes(user.role);

  // Si el usuario no tiene permisos, no mostrar nada
  if (!hasPermission) {
    return null;
  }

  // Hook para cargar logs (solo si tiene permisos)
  const {
    data: logsData,
    isLoading,
    error,
  } = useVoucherLogs(voucherId, hasPermission);

  // Handler para abrir modal con observaciones
  const handleOpenObservations = (log: LogTableRow) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Estado de carga
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando historial...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error al cargar
  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar el historial. Por favor, intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transformar logs a filas de tabla
  const tableRows = logsData ? transformLogsToTableRows(logsData) : [];

  // Caso: Sin logs registrados
  if (tableRows.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay transacciones registradas para este vale.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Los logs aparecerán cuando se valide la salida o se confirme la entrada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar tabla con logs
  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <FileText className="h-5 w-5" />
          Historial de Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900 dark:text-gray-100">
                  Tipo de Log
                </TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">
                  Estado
                </TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">
                  Responsable
                </TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">
                  Observaciones
                </TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">
                  Fecha
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={`${row.log_type}-${row.id}`}>
                  {/* Tipo de Log */}
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {getLogTypeName(row.log_type)}
                  </TableCell>

                  {/* Estado con Badge - Colores correctos: verde si OK, rojo si NO OK */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColorClasses(row.status)}`}
                    >
                      {getStatusDisplayName(row.status, row.log_type)}
                    </span>
                  </TableCell>

                  {/* Responsable */}
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {row.responsible_name}
                  </TableCell>

                  {/* Observaciones - Clickeable para ver mensaje completo */}
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    <button
                      onClick={() => handleOpenObservations(row)}
                      className="max-w-xs truncate text-left hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                      title="Click para ver observaciones completas"
                    >
                      <Eye className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{row.observations}</span>
                    </button>
                  </TableCell>

                  {/* Fecha formateada */}
                  <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatLogDate(row.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Nota:</strong> Historial privado visible solo para administradores, gerentes y supervisores.
          </p>
        </div>
      </CardContent>

      {/* Modal para mostrar observaciones completas */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl shadow-2xl border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: '#f9fafb' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#1f2937' }}>
              Observaciones del Registro
            </DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <span className="text-sm" style={{ color: '#374151' }}>
                  {getLogTypeName(selectedLog.log_type)} - {formatLogDate(selectedLog.created_at)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Estado */}
              <div>
                <label className="text-sm font-medium" style={{ color: '#111827' }}>
                  Estado:
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColorClasses(selectedLog.status)}`}
                  >
                    {getStatusDisplayName(selectedLog.status, selectedLog.log_type)}
                  </span>
                </div>
              </div>

              {/* Responsable */}
              <div>
                <label className="text-sm font-medium" style={{ color: '#111827' }}>
                  Responsable:
                </label>
                <p className="mt-1 text-sm" style={{ color: '#1f2937' }}>
                  {selectedLog.responsible_name}
                </p>
              </div>

              {/* Observaciones completas */}
              <div>
                <label className="text-sm font-medium" style={{ color: '#111827' }}>
                  Observaciones:
                </label>
                <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                  <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {selectedLog.observations}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
