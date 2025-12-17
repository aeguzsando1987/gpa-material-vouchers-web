'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Voucher } from '@/lib/types/voucher';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface VoucherSummaryCardProps {
  vouchers: Voucher[];
}

export default function VoucherSummaryCard({ vouchers }: VoucherSummaryCardProps) {
  const stats = useMemo(() => {
    return {
      total: vouchers.length,
      pending: vouchers.filter((v) => v.status === 'PENDING').length,
      approved: vouchers.filter((v) => v.status === 'APPROVED').length,
      cancelled: vouchers.filter((v) => v.status === 'CANCELLED').length,
    };
  }, [vouchers]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vales</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            En esta vista
          </p>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Requieren aprobación
          </p>
        </CardContent>
      </Card>

      {/* Aprobados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ya procesados
          </p>
        </CardContent>
      </Card>

      {/* Cancelados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.cancelled}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cancelados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
