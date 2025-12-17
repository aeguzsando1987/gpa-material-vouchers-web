'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVouchers } from '@/hooks/useVouchers';
import type { VoucherFilters } from '@/lib/types/voucher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import VoucherFiltersCard from './components/VoucherFiltersCard';
import VoucherSummaryCard from './components/VoucherSummaryCard';
import ApproveVoucherDialog from './components/ApproveVoucherDialog';
import CancelVoucherDialog from './components/CancelVoucherDialog';

export default function ApproveVouchersPage() {
  const [filters, setFilters] = useState<VoucherFilters>({
    voucher_type: 'EXIT',  // IMPORTANTE: Solo vales de SALIDA
    status: 'PENDING',      // Por defecto mostrar pendientes
    page: 1,
    per_page: 20,
  });

  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: response, isLoading, error } = useVouchers({
    page: filters.page,
    per_page: filters.per_page,
    active_only: true,
  });

  // Filtrar vouchers del lado del cliente
  const allVouchers = response?.vouchers || [];
  const vouchers = allVouchers.filter((voucher) => {
    // Filtro por tipo (siempre EXIT)
    if (filters.voucher_type && voucher.voucher_type !== filters.voucher_type) {
      return false;
    }

    // Filtro por estado
    if (filters.status && voucher.status !== filters.status) {
      return false;
    }

    // Filtro por with_return (tipo de salida)
    if (filters.with_return !== undefined && voucher.with_return !== filters.with_return) {
      return false;
    }

    // Filtro por búsqueda (folio)
    if (filters.search && !voucher.folio.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Handlers para abrir dialogs
  const handleApproveClick = (voucherId: number) => {
    setSelectedVoucherId(voucherId);
    setShowApproveDialog(true);
  };

  const handleCancelClick = (voucherId: number) => {
    setSelectedVoucherId(voucherId);
    setShowCancelDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Aprobar Vales</h1>
        <p className="text-muted-foreground">
          Gestiona la aprobación de vales pendientes de salida
        </p>
      </div>

      {/* Filtros */}
      <VoucherFiltersCard filters={filters} onFiltersChange={setFilters} />

      {/* Estadísticas */}
      <VoucherSummaryCard vouchers={vouchers} />

      {/* Tabla de Vales */}
      <Card>
        <CardHeader>
          <CardTitle>Vales Pendientes de Aprobación</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error al cargar vales. Intenta recargar la página.
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay vales pendientes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                No se encontraron vales que coincidan con los filtros seleccionados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Creador</TableHead>
                    <TableHead>Tipo Salida</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => {
                    // Determinar tipo de salida
                    let tipoSalida = '';
                    if (voucher.is_intercompany) {
                      tipoSalida = 'Intercompañía';
                    } else if (voucher.with_return) {
                      tipoSalida = 'Con Retorno';
                    } else {
                      tipoSalida = 'Sin Retorno';
                    }

                    // Determinar destino
                    const destino = voucher.is_intercompany
                      ? `Sucursal ID: ${voucher.destination_branch_id || 'N/A'}`
                      : voucher.outer_destination || 'N/A';

                    return (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono text-sm">
                          <Link
                            href={`/my-vouchers/${voucher.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {voucher.folio}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          Usuario ID: {voucher.delivered_by_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tipoSalida}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {destino}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(voucher.created_at).toLocaleDateString('es-MX')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              voucher.status === 'PENDING'
                                ? 'secondary'
                                : voucher.status === 'APPROVED'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {voucher.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {voucher.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveClick(voucher.id)}
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelClick(voucher.id)}
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación info */}
      {response && response.total > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {vouchers.length} de {response.total} vales
        </div>
      )}

      {/* Dialogs */}
      {selectedVoucherId && (
        <>
          <ApproveVoucherDialog
            voucherId={selectedVoucherId}
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
          />
          <CancelVoucherDialog
            voucherId={selectedVoucherId}
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          />
        </>
      )}
    </div>
  );
}
