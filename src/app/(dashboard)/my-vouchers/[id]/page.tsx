'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useVoucher } from '@/hooks/useVouchers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVoucherTypeName, getVoucherStatusName } from '@/lib/types/voucher';
import VoucherDetailsManager from '@/components/vouchers/VoucherDetailsManager';
import VoucherActions from '@/components/vouchers/VoucherActions';
import VoucherLogsTable from '@/components/vouchers/VoucherLogsTable';

export default function VoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const voucherId = parseInt(params.id as string);

  const { data: voucher, isLoading: loadingVoucher, error } = useVoucher(voucherId);

  if (loadingVoucher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/my-vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se pudo cargar el vale. Por favor, intenta nuevamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEditDetails = voucher.status === 'PENDING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/my-vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{voucher.folio}</h1>
            <p className="text-muted-foreground">
              {getVoucherTypeName(voucher.voucher_type)}
            </p>
          </div>
        </div>
        <Badge variant={voucher.status === 'PENDING' ? 'secondary' : 'default'}>
          {getVoucherStatusName(voucher.status)}
        </Badge>
      </div>

      {/* Botones de Acción */}
      <VoucherActions voucher={voucher} />

      {/* Información del Voucher */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Vale</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
              <dd className="text-sm">{getVoucherTypeName(voucher.voucher_type)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
              <dd className="text-sm">{getVoucherStatusName(voucher.status)}</dd>
            </div>
            {voucher.with_return && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Fecha de Retorno Estimada
                </dt>
                <dd className="text-sm">
                  {voucher.estimated_return_date
                    ? new Date(voucher.estimated_return_date).toLocaleDateString()
                    : 'No especificada'}
                </dd>
              </div>
            )}
            {voucher.outer_destination && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Destino Externo
                </dt>
                <dd className="text-sm">{voucher.outer_destination}</dd>
              </div>
            )}
            {voucher.notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notas</dt>
                <dd className="text-sm">{voucher.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Líneas de Detalle */}
      <VoucherDetailsManager voucherId={voucherId} canEdit={canEditDetails} />

      {/* Historial de Transacciones (Logs) - Solo Admin/Manager/Supervisor */}
      <VoucherLogsTable voucherId={voucherId} />
    </div>
  );
}
