'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { VoucherFilters } from '@/lib/types/voucher';
import { X, Filter } from 'lucide-react';

interface VoucherFiltersCardProps {
  filters: VoucherFilters;
  onFiltersChange: (filters: VoucherFilters) => void;
}

export default function VoucherFiltersCard({
  filters,
  onFiltersChange,
}: VoucherFiltersCardProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      voucher_type: 'EXIT',  // Mantener siempre EXIT
      status: value === 'all' ? undefined : value as any,
      page: 1, // Reset pagination
    });
  };

  const handleWithReturnChange = (value: string) => {
    let withReturn: boolean | undefined = undefined;
    if (value === 'with_return') withReturn = true;
    if (value === 'without_return') withReturn = false;

    onFiltersChange({
      ...filters,
      voucher_type: 'EXIT',  // Mantener siempre EXIT
      with_return: withReturn,
      page: 1,
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      voucher_type: 'EXIT',  // Siempre EXIT
      status: 'PENDING',
      page: 1,
      per_page: 20,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro: Estado */}
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PENDING_IO_APPROVAL">Pend. Contraloría</SelectItem>
                <SelectItem value="APPROVED">Aprobado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Con Retorno / Sin Retorno */}
          <div>
            <Label htmlFor="with_return">Tipo de Salida</Label>
            <Select
              value={
                filters.with_return === true
                  ? 'with_return'
                  : filters.with_return === false
                  ? 'without_return'
                  : 'all'
              }
              onValueChange={handleWithReturnChange}
            >
              <SelectTrigger id="with_return">
                <SelectValue placeholder="Tipo de salida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with_return">Con Retorno</SelectItem>
                <SelectItem value="without_return">Sin Retorno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro: Búsqueda */}
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar por Folio</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder="Ej: ACM-SAL-2025-0001"
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {filters.search && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Botón Limpiar */}
          <div className="md:col-span-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
