'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useVoucher } from '@/hooks/useVouchers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VoucherEditForm from '@/components/forms/VoucherEditForm';

export default function EditVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const voucherId = parseInt(params.id as string);

  const { data: voucher, isLoading, error } = useVoucher(voucherId);

  if (isLoading) {
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

  // Verificar que el vale esté en estado PENDING
  if (voucher.status !== 'PENDING') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/my-vouchers/${voucherId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Vale
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">No se puede editar este vale</h3>
              <p className="text-muted-foreground">
                Solo los vales en estado <strong>PENDIENTE</strong> pueden ser editados.
                <br />
                Este vale tiene estado: <strong>{voucher.status}</strong>
              </p>
              <Button onClick={() => router.push(`/my-vouchers/${voucherId}`)}>
                Ver Detalle del Vale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push(`/my-vouchers/${voucherId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Vale</h1>
          <p className="text-muted-foreground">
            {voucher.folio}
          </p>
        </div>
      </div>

      {/* Formulario de Edición */}
      <VoucherEditForm voucher={voucher} />
    </div>
  );
}
