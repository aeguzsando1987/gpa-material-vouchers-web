'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useVoucher } from '@/hooks/useVouchers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVoucherTypeName, getVoucherStatusName } from '@/lib/types/voucher';
import { formatDateWithoutTimezone, formatDateTime } from '@/lib/utils/dateHelpers';
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
            {/* Información básica */}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
              <dd className="text-sm">{getVoucherTypeName(voucher.voucher_type)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
              <dd className="text-sm">{getVoucherStatusName(voucher.status)}</dd>
            </div>

            {/* Empresa */}
            {voucher.company_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Empresa</dt>
                <dd className="text-sm">{voucher.company_name}</dd>
              </div>
            )}

            {/* Fecha de creación */}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Fecha de Creación</dt>
              <dd className="text-sm">
                {formatDateTime(voucher.created_at, 'es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            {/* Características */}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Con Retorno</dt>
              <dd className="text-sm">{voucher.with_return ? 'Sí' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Intercompañía</dt>
              <dd className="text-sm">{voucher.is_intercompany ? 'Sí' : 'No'}</dd>
            </div>

            {/* Sucursales */}
            {voucher.origin_branch_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sucursal Origen</dt>
                <dd className="text-sm">{voucher.origin_branch_name}</dd>
              </div>
            )}
            {voucher.destination_branch_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sucursal Destino</dt>
                <dd className="text-sm">{voucher.destination_branch_name}</dd>
              </div>
            )}

            {/* Responsables */}
            {voucher.delivered_by_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Entregado Por</dt>
                <dd className="text-sm">{voucher.delivered_by_name}</dd>
              </div>
            )}
            {voucher.approved_by_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Aprobado Por</dt>
                <dd className="text-sm">{voucher.approved_by_name}</dd>
              </div>
            )}
            {voucher.received_by_name && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Recibido Por</dt>
                <dd className="text-sm">{voucher.received_by_name}</dd>
              </div>
            )}

            {/* Fecha de retorno estimada */}
            {voucher.with_return && voucher.estimated_return_date && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Fecha de Retorno Estimada
                </dt>
                <dd className="text-sm">
                  {formatDateWithoutTimezone(voucher.estimated_return_date)}
                </dd>
              </div>
            )}

            {/* Destino externo */}
            {voucher.outer_destination && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Destino Externo
                </dt>
                <dd className="text-sm">{voucher.outer_destination}</dd>
              </div>
            )}

            {/* Notas */}
            {voucher.notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notas</dt>
                <dd className="text-sm whitespace-pre-wrap">{voucher.notes}</dd>
              </div>
            )}
            {voucher.internal_notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notas Internas</dt>
                <dd className="text-sm whitespace-pre-wrap text-orange-600">{voucher.internal_notes}</dd>
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
