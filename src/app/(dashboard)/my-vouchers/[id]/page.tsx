'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useVoucher } from '@/hooks/useVouchers';
import { useVoucherDetails } from '@/hooks/useVoucherDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVoucherTypeName, getVoucherStatusName } from '@/lib/types/voucher';
import VoucherDetailForm from '@/components/forms/VoucherDetailForm';
import VoucherDetailList from '@/components/vouchers/VoucherDetailList';
import VoucherActions from '@/components/vouchers/VoucherActions';
import { useState } from 'react';

export default function VoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const voucherId = parseInt(params.id as string);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: voucher, isLoading: loadingVoucher, error } = useVoucher(voucherId);
  const { data: details, isLoading: loadingDetails } = useVoucherDetails(voucherId);

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

  const canAddDetails = voucher.status === 'PENDING';
  const currentDetailCount = details?.length || 0;
  const maxDetailsReached = currentDetailCount >= 20;

  // Función para encontrar el siguiente número de línea disponible
  const getNextAvailableLineNumber = (): number => {
    if (!details || details.length === 0) return 1;

    // Obtener todos los números de línea existentes
    const existingLineNumbers = details.map(d => d.line_number).sort((a, b) => a - b);

    // Encontrar el primer número disponible del 1 al 20
    for (let i = 1; i <= 20; i++) {
      if (!existingLineNumbers.includes(i)) {
        return i;
      }
    }

    return 21; // Si todos están ocupados (esto no debería pasar)
  };

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Líneas de Detalle</CardTitle>
              <CardDescription>
                {currentDetailCount} de 20 líneas agregadas
              </CardDescription>
            </div>
            {canAddDetails && !maxDetailsReached && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Línea
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para agregar línea */}
          {showAddForm && canAddDetails && (
            <VoucherDetailForm
              voucherId={voucherId}
              lineNumber={getNextAvailableLineNumber()}
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Advertencia si alcanzó el máximo */}
          {maxDetailsReached && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Has alcanzado el máximo de 20 líneas de detalle para este vale.
              </p>
            </div>
          )}

          {/* Advertencia si el vale no está en PENDING */}
          {!canAddDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Este vale ya no puede ser modificado porque su estado es {getVoucherStatusName(voucher.status)}.
              </p>
            </div>
          )}

          {/* Lista de líneas */}
          {loadingDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : details && details.length > 0 ? (
            <VoucherDetailList
              details={details}
              voucherId={voucherId}
              canEdit={canAddDetails}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay líneas de detalle agregadas.</p>
              {canAddDetails && !showAddForm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Línea
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
