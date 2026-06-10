'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Truck, AlertTriangle, AlertCircle, Ban, Search } from 'lucide-react';
import { useVouchers } from '@/hooks/useVouchers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { VoucherStatus, VoucherType } from '@/lib/types/voucher';

// Mapeo de estados a colores y textos en español
const STATUS_CONFIG: Record<VoucherStatus, { label: string; className: string }> = {
  PENDING:             { label: 'Pendiente',         className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  PENDING_IO_APPROVAL: { label: 'Pend. Contraloría', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  APPROVED:            { label: 'Aprobado',           className: 'bg-blue-100 text-blue-800 border-blue-300' },
  IN_TRANSIT:          { label: 'En Tránsito',        className: 'bg-purple-100 text-purple-800 border-purple-300' },
  OVERDUE:             { label: 'Vencido',            className: 'bg-orange-100 text-orange-800 border-orange-300' },
  INCOMPLETE_DAMAGED:  { label: 'Incompleto/Dañado',  className: 'bg-red-100 text-red-800 border-red-300' },
  CLOSED:              { label: 'Cerrado',            className: 'bg-green-100 text-green-800 border-green-300' },
  CANCELLED:           { label: 'Cancelado',          className: 'bg-neutral-100 text-neutral-600 border-neutral-300' },
};

const TYPE_CONFIG: Record<VoucherType, { label: string; icon: typeof FileText }> = {
  ENTRY: { label: 'Entrada', icon: FileText },
  EXIT: { label: 'Salida', icon: FileText },
};

export default function MyVouchersPage() {
  const [page] = useState(1);
  const [perPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'ALL'>('ALL');
  const [orderBy, setOrderBy] = useState<string>('created_at');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para cambiar el ordenamiento
  const handleSort = (column: string) => {
    if (orderBy === column) {
      // Si ya está ordenando por esta columna, cambiar dirección
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una columna nueva, ordenar descendente por defecto
      setOrderBy(column);
      setOrderDirection('desc');
    }
  };

  // Renderizar icono de ordenamiento
  const renderSortIcon = (column: string) => {
    if (orderBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return orderDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const { data: vouchersResponse, isLoading, error } = useVouchers({
    page: page,
    per_page: perPage,
    active_only: true,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    order_by: orderBy,
    order_direction: orderDirection,
  });

  const vouchers = vouchersResponse?.vouchers || [];

  // Filtrar por búsqueda de folio (cliente-side)
  const filteredVouchers = vouchers.filter((voucher) => {
    if (!searchTerm.trim()) return true;
    return voucher.folio.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

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
          <Button className="transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Vale
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Clickeables para filtrar */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {/* Total */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ALL' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setStatusFilter('ALL')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchersResponse?.total || 0}</div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PENDING' ? 'ring-2 ring-yellow-500' : ''
          }`}
          onClick={() => setStatusFilter('PENDING')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        {/* Aprobados */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'APPROVED' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setStatusFilter('APPROVED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>

        {/* En Tránsito */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'IN_TRANSIT' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setStatusFilter('IN_TRANSIT')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">En Tránsito</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'IN_TRANSIT').length}
            </div>
          </CardContent>
        </Card>

        {/* Vencidos */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'OVERDUE' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => setStatusFilter('OVERDUE')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'OVERDUE').length}
            </div>
          </CardContent>
        </Card>

        {/* Incompleto/Dañado */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'INCOMPLETE_DAMAGED' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => setStatusFilter('INCOMPLETE_DAMAGED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Incompleto</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'INCOMPLETE_DAMAGED').length}
            </div>
          </CardContent>
        </Card>

        {/* Cerrados */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'CLOSED' ? 'ring-2 ring-gray-500' : ''
          }`}
          onClick={() => setStatusFilter('CLOSED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Cerrados</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'CLOSED').length}
            </div>
          </CardContent>
        </Card>

        {/* Cancelados */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'CANCELLED' ? 'ring-2 ring-red-700' : ''
          }`}
          onClick={() => setStatusFilter('CANCELLED')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Cancelados</CardTitle>
            <Ban className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVouchers.filter((v) => v.status === 'CANCELLED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Vales</CardTitle>
              <CardDescription>
                Visualiza y gestiona todos tus vales de material
              </CardDescription>
            </div>
            {/* Búsqueda y Filtros */}
            <div className="flex items-center gap-4">
              {/* Búsqueda por Folio */}
              <div className="relative w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por folio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Filtro por Status */}
              <div className="w-[200px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as VoucherStatus | 'ALL')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobado</SelectItem>
                    <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                    <SelectItem value="OVERDUE">Vencido</SelectItem>
                    <SelectItem value="INCOMPLETE_DAMAGED">Incompleto/Dañado</SelectItem>
                    <SelectItem value="CLOSED">Cerrado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchTerm.trim() ? 'No se encontraron vales' : 'No tienes vales aún'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm.trim()
                  ? `No hay vales que coincidan con "${searchTerm}"`
                  : 'Crea tu primer vale haciendo clic en el botón "Nuevo Vale"'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('folio')}
                    >
                      <span>Folio</span>
                      {renderSortIcon('folio')}
                    </Button>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Con Retorno</TableHead>
                  <TableHead>Intercompañía</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('created_at')}
                    >
                      <span>Fecha Creación</span>
                      {renderSortIcon('created_at')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
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
                      <Badge variant="outline" className={STATUS_CONFIG[voucher.status].className}>
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
          {searchTerm.trim() ? (
            <>
              Mostrando {filteredVouchers.length} resultado{filteredVouchers.length !== 1 ? 's' : ''} de {vouchers.length} vales
              {filteredVouchers.length < vouchers.length && (
                <span className="text-blue-600 ml-1">(filtrado por "{searchTerm}")</span>
              )}
            </>
          ) : (
            <>Mostrando {filteredVouchers.length} de {vouchersResponse.total} vales</>
          )}
        </div>
      )}
    </div>
  );
}
