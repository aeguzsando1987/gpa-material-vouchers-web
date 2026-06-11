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
import { formatDateTime } from '@/lib/utils/dateHelpers';

interface VoucherLogsTableProps {
  voucherId: number;
}

export default function VoucherLogsTable({ voucherId }: VoucherLogsTableProps) {
  const { user } = useAuthStore();
  const [selectedLog, setSelectedLog] = useState<LogTableRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPermission = user && [1, 2, 3].includes(user.role);

  if (!hasPermission) return null;

  const { data: logsData, isLoading, error } = useVoucherLogs(voucherId, hasPermission);

  const handleOpenObservations = (log: LogTableRow) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-neutral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-900">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            <span className="ml-2 text-sm text-neutral-500">Cargando historial...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-neutral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-900">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Error al cargar el historial. Por favor, intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tableRows = logsData ? transformLogsToTableRows(logsData) : [];

  if (tableRows.length === 0) {
    return (
      <Card className="bg-white border border-neutral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-900">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">
              No hay transacciones registradas para este vale.
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Los registros aparecerán conforme se apruebe el vale (jefe directo y
              contraloría) y se valide la salida o entrada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-neutral-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neutral-900">
          <FileText className="h-5 w-5" />
          Historial de Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-neutral-900">Tipo de Log</TableHead>
                <TableHead className="text-neutral-900">Estado</TableHead>
                <TableHead className="text-neutral-900">Responsable</TableHead>
                <TableHead className="text-neutral-900">Observaciones</TableHead>
                <TableHead className="text-neutral-900">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={`${row.log_type}-${row.id}`}>
                  <TableCell className="font-medium text-neutral-900">
                    {getLogTypeName(row.log_type)}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColorClasses(row.status)}`}
                    >
                      {getStatusDisplayName(row.status, row.log_type)}
                    </span>
                  </TableCell>

                  <TableCell className="text-neutral-700">
                    {row.responsible_name}
                  </TableCell>

                  <TableCell className="text-neutral-600">
                    <button
                      onClick={() => handleOpenObservations(row)}
                      className="max-w-xs truncate text-left hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                      title="Click para ver observaciones completas"
                    >
                      <Eye className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{row.observations}</span>
                    </button>
                  </TableCell>

                  <TableCell className="text-neutral-600 whitespace-nowrap">
                    {formatDateTime(row.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> Historial privado visible solo para administradores, gerentes y supervisores.
          </p>
        </div>
      </CardContent>

      {/* Modal de observaciones completas */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-neutral-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-neutral-900">
              Observaciones del Registro
            </DialogTitle>
            <DialogDescription className="text-neutral-600">
              {selectedLog && (
                <span className="text-sm">
                  {getLogTypeName(selectedLog.log_type)} — {formatDateTime(selectedLog.created_at)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-900">Estado:</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColorClasses(selectedLog.status)}`}
                  >
                    {getStatusDisplayName(selectedLog.status, selectedLog.log_type)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-900">Responsable:</label>
                <p className="mt-1 text-sm text-neutral-700">{selectedLog.responsible_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-900">Observaciones:</label>
                <div className="mt-1 p-3 bg-neutral-50 rounded-md border border-neutral-200">
                  <p className="text-sm whitespace-pre-wrap text-neutral-900">
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
