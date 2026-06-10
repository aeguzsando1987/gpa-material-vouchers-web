'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Edit, Loader2, ShieldCheck } from 'lucide-react';
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
import { useApproveVoucher, useApproveIOVoucher, useCancelVoucher } from '@/hooks/useVouchers';
import { useAuthStore } from '@/lib/store/authStore';
import { canApproveVouchers, isIOManager } from '@/lib/types/auth';
import { Voucher } from '@/lib/types/voucher';
import { PrintVoucherButton } from './PrintVoucherButton';

interface VoucherActionsProps {
  voucher: Voucher;
}

export default function VoucherActions({ voucher }: VoucherActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const approveVoucher = useApproveVoucher();
  const approveIOVoucher = useApproveIOVoucher();
  const cancelVoucher = useCancelVoucher();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showApproveIODialog, setShowApproveIODialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!user) return null;

  const userCanApprove = canApproveVouchers(user.role);
  const userIsIOManager = isIOManager(user);
  const isPending = voucher.status === 'PENDING';
  const isPendingIO = voucher.status === 'PENDING_IO_APPROVAL';
  const isApproved = voucher.status === 'APPROVED';

  // Botón APROBAR (1ª aprobación): solo si status=PENDING y usuario tiene permisos
  const showApproveButton = isPending && userCanApprove;

  // Botón APROBACIÓN CONTRALORÍA (2ª aprobación): solo si status=PENDING_IO_APPROVAL
  // y el usuario es contralor (io manager)
  const showApproveIOButton = isPendingIO && userIsIOManager;

  // Botón CANCELAR: si status=PENDING, PENDING_IO_APPROVAL o APPROVED y usuario tiene permisos
  const showCancelButton = (isPending || isPendingIO || isApproved) && userCanApprove;

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

  const handleApproveIOClick = () => {
    setShowApproveIODialog(true);
  };

  const handleApproveIOConfirm = async () => {
    try {
      await approveIOVoucher.mutateAsync({ id: voucher.id });
      setShowApproveIODialog(false);
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

  // NOTA: Siempre renderizar porque el botón de imprimir debe estar siempre visible

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Botón de Imprimir - SIEMPRE visible */}
        <PrintVoucherButton
          voucherId={voucher.id}
          voucherFolio={voucher.folio}
          variant="outline"
          showLabel={true}
        />

        {showApproveButton && (
          <Button
            onClick={handleApproveClick}
            disabled={approveVoucher.isPending}
            className="bg-green-600 text-white hover:bg-green-800 transition-colors duration-200 dark:bg-green-500 dark:hover:bg-green-700"
          >
            {approveVoucher.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Aprobar
          </Button>
        )}

        {showApproveIOButton && (
          <Button
            onClick={handleApproveIOClick}
            disabled={approveIOVoucher.isPending}
            className="bg-indigo-600 text-white hover:bg-indigo-800 transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-700"
          >
            {approveIOVoucher.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            Aprobación Contraloría
          </Button>
        )}

        {showCancelButton && (
          <Button
            onClick={handleCancelClick}
            disabled={cancelVoucher.isPending}
            className="bg-red-600 text-white hover:bg-red-800 transition-colors duration-200 dark:bg-red-500 dark:hover:bg-red-700"
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
          <Button
            onClick={handleEditClick}
            className="bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Dialog de confirmación para Aprobar */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">¿Aprobar este vale? (1ª aprobación)</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Al aprobar el vale <strong>{voucher.folio}</strong>, este pasará a{' '}
              <strong>Pendiente de Contraloría</strong>. Un contralor (io manager) deberá dar la
              segunda aprobación antes de que el vale quede disponible para validación de salida.
              <br />
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={approveVoucher.isPending}
              className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={approveVoucher.isPending}
              className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
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

      {/* Dialog de confirmación para Aprobación de Contraloría (2ª aprobación) */}
      <AlertDialog open={showApproveIODialog} onOpenChange={setShowApproveIODialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">¿Aprobar como contraloría? (2ª aprobación)</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Al dar la aprobación de contraloría al vale <strong>{voucher.folio}</strong>, este
              cambiará a estado <strong>APROBADO</strong> y quedará listo para validación de salida.
              <br />
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={approveIOVoucher.isPending}
              className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveIOConfirm}
              disabled={approveIOVoucher.isPending}
              className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {approveIOVoucher.isPending ? (
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
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Cancelar Vale</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Vas a cancelar el vale <strong>{voucher.folio}</strong>. Por favor ingresa
              la razón de cancelación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason" className="text-gray-900 dark:text-gray-100">
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
                className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${reasonError ? 'border-red-500' : ''}`}
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
              className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelVoucher.isPending}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
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
