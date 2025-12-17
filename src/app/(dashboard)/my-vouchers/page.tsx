'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useVouchers } from '@/hooks/useVouchers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { VoucherStatus, VoucherType } from '@/lib/types/voucher';

// Mapeo de estados a colores y textos en español
const STATUS_CONFIG: Record<VoucherStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'secondary' },
  APPROVED: { label: 'Aprobado', variant: 'default' },
  IN_TRANSIT: { label: 'En Tránsito', variant: 'outline' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' },
  INCOMPLETE_DAMAGED: { label: 'Incompleto/Dañado', variant: 'destructive' }, // NUEVO
  CLOSED: { label: 'Cerrado', variant: 'outline' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
};

const TYPE_CONFIG: Record<VoucherType, { label: string; icon: typeof FileText }> = {
  ENTRY: { label: 'Entrada', icon: FileText },
  EXIT: { label: 'Salida', icon: FileText },
};

export default function MyVouchersPage() {
  const [page] = useState(1);
  const [perPage] = useState(20);

  const { data: vouchersResponse, isLoading, error } = useVouchers({
    page: page,
    per_page: perPage,
    active_only: true,
  });

  const vouchers = vouchersResponse?.vouchers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Vales</h1>
          <p className="text-muted-foreground">
            Gestiona tus vales de entrada y salida de material
          </p>
        </div>
        <Link href="/my-vouchers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Vale
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchersResponse?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.filter((v) => v.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.filter((v) => v.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.filter((v) => v.status === 'CLOSED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vales</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos tus vales de material
          </CardDescription>
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
              <h3 className="mt-4 text-lg font-semibold">No tienes vales aún</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Crea tu primer vale haciendo clic en el botón "Nuevo Vale"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Con Retorno</TableHead>
                  <TableHead>Intercompañía</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/my-vouchers/${voucher.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {voucher.folio}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {TYPE_CONFIG[voucher.voucher_type].label}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      Empresa ID: {voucher.company_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_CONFIG[voucher.status].variant}>
                        {STATUS_CONFIG[voucher.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {voucher.with_return ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {voucher.is_intercompany ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(voucher.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination info */}
      {vouchersResponse && vouchersResponse.total > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {vouchers.length} de {vouchersResponse.total} vales
        </div>
      )}
    </div>
  );
}
