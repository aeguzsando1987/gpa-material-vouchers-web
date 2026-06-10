'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VoucherSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: number;
  voucherFolio: string;
}

/**
 * Modal que aparece después de crear un vale exitosamente
 * Ofrece 2 opciones: Ver Vale Completo, Crear Otro Vale
 *
 * NOTA: La impresión NO se ofrece aquí porque un vale recién creado está en
 * estado PENDING. El vale solo puede imprimirse una vez que pasó la doble
 * aprobación (jefe directo + contraloría); ese botón vive en la página de
 * detalle del vale (VoucherActions).
 */
export const VoucherSuccessModal = ({
  isOpen,
  onClose,
  voucherId,
  voucherFolio,
}: VoucherSuccessModalProps) => {
  const router = useRouter();

  const handleViewVoucher = () => {
    router.push(`/my-vouchers/${voucherId}`);
    onClose();
  };

  const handleCreateAnother = () => {
    router.push('/my-vouchers/create');
    onClose();
  };

  // Al cerrar el modal (ESC, click fuera, X), redirigir al detalle del vale
  const handleClose = () => {
    router.push(`/my-vouchers/${voucherId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-50 border-gray-200">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg text-gray-900">
                Vale Creado Exitosamente
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base text-gray-700">
            El vale{' '}
            <strong className="text-gray-900 font-semibold">
              {voucherFolio}
            </strong>{' '}
            ha sido creado correctamente.
            <br />
            <span className="text-sm text-gray-600 mt-1 block">
              Podrás imprimirlo desde el detalle del vale una vez que esté
              aprobado (jefe directo y contraloría).
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {/* Botón principal: Ver Vale Completo */}
          <Button
            onClick={handleViewVoucher}
            className="w-full"
            size="lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            Ver Vale Completo
          </Button>

          {/* Botón secundario: Crear Otro Vale */}
          <Button
            onClick={handleCreateAnother}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Crear Otro Vale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
