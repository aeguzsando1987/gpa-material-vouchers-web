'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApproveVoucher, useCancelVoucher } from '@/hooks/useVouchers';
import { useAuthStore } from '@/lib/store/authStore';
import { canApproveVouchers } from '@/lib/types/auth';
import { Voucher } from '@/lib/types/voucher';

interface VoucherActionsProps {
  voucher: Voucher;
}

export default function VoucherActions({ voucher }: VoucherActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const approveVoucher = useApproveVoucher();
  const cancelVoucher = useCancelVoucher();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!user) return null;

  const userCanApprove = canApproveVouchers(user.role);
  const isPending = voucher.status === 'PENDING';
  const isApproved = voucher.status === 'APPROVED';

  // Botón APROBAR: solo si status=PENDING y usuario tiene permisos
  const showApproveButton = isPending && userCanApprove;

  // Botón CANCELAR: si status=PENDING o APPROVED y usuario tiene permisos
  const showCancelButton = (isPending || isApproved) && userCanApprove;

  // Botón EDITAR: solo si status=PENDING
  const showEditButton = isPending;

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = async () => {
    try {
      await approveVoucher.mutateAsync({ id: voucher.id });
      setShowApproveDialog(false);
    } catch (error) {
      // Error ya manejado por el hook con toast
    }
  };

  const handleCancelClick = () => {
    setCancellationReason('');
    setReasonError('');
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    // Validar que se ingresó una razón
    if (!cancellationReason.trim()) {
      setReasonError('Debe ingresar una razón de cancelación');
      return;
    }

    try {
      await cancelVoucher.mutateAsync({
        id: voucher.id,
        data: { cancellation_reason: cancellationReason.trim() },
      });
      setShowCancelDialog(false);
      setCancellationReason('');
    } catch (error) {
      // Error ya manejado por el hook con toast
    }
  };

  const handleEditClick = () => {
    router.push(`/my-vouchers/${voucher.id}/edit`);
  };

  // Si no hay botones visibles, no renderizar nada
  if (!showApproveButton && !showCancelButton && !showEditButton) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {showApproveButton && (
          <Button
            onClick={handleApproveClick}
            disabled={approveVoucher.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {approveVoucher.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Aprobar
          </Button>
        )}

        {showCancelButton && (
          <Button
            onClick={handleCancelClick}
            disabled={cancelVoucher.isPending}
            variant="destructive"
          >
            {cancelVoucher.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Cancelar
          </Button>
        )}

        {showEditButton && (
          <Button onClick={handleEditClick} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Dialog de confirmación para Aprobar */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar este vale?</AlertDialogTitle>
            <AlertDialogDescription>
              Al aprobar el vale <strong>{voucher.folio}</strong>, este cambiará a estado{' '}
              <strong>APROBADO</strong> y estará listo para validación de salida.
              <br />
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveVoucher.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={approveVoucher.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveVoucher.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aprobando...
                </>
              ) : (
                'Confirmar Aprobación'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para Cancelar con razón requerida */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Vale</DialogTitle>
            <DialogDescription>
              Vas a cancelar el vale <strong>{voucher.folio}</strong>. Por favor ingresa
              la razón de cancelación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">
                Razón de Cancelación *
              </Label>
              <Textarea
                id="cancellation_reason"
                placeholder="Describe el motivo de la cancelación..."
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  setReasonError('');
                }}
                rows={4}
                className={reasonError ? 'border-red-500' : ''}
              />
              {reasonError && (
                <p className="text-sm text-red-500">{reasonError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason('');
                setReasonError('');
              }}
              disabled={cancelVoucher.isPending}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelVoucher.isPending}
            >
              {cancelVoucher.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
