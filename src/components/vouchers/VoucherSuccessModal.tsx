'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer, Eye, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGeneratePDF } from '@/hooks/useGeneratePDF';

interface VoucherSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: number;
  voucherFolio: string;
}

/**
 * Modal que aparece después de crear un vale exitosamente
 * Ofrece 3 opciones: Imprimir, Ver Vale Completo, Crear Otro Vale
 */
export const VoucherSuccessModal = ({
  isOpen,
  onClose,
  voucherId,
  voucherFolio,
}: VoucherSuccessModalProps) => {
  const router = useRouter();
  const { generateAndDownload, isGenerating, progress } = useGeneratePDF();

  const handlePrint = async () => {
    const success = await generateAndDownload(voucherId, voucherFolio);
    // No cerrar modal automáticamente, dejar que usuario decida
    if (success) {
      // Opcionalmente, podrías cerrar el modal aquí si lo prefieres
      // onClose();
    }
  };

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
              Puedes imprimirlo ahora o verlo más tarde.
            </span>
            {isGenerating && (
              <span className="block mt-3 text-sm text-blue-600 font-medium">
                {progress}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {/* Botón principal: Imprimir Vale */}
          <Button
            onClick={handlePrint}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-5 w-5" />
                Imprimir Vale
              </>
            )}
          </Button>

          {/* Botón secundario: Ver Vale Completo */}
          <Button
            onClick={handleViewVoucher}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isGenerating}
          >
            <Eye className="mr-2 h-5 w-5" />
            Ver Vale Completo
          </Button>

          {/* Botón terciario: Crear Otro Vale */}
          <Button
            onClick={handleCreateAnother}
            variant="ghost"
            className="w-full"
            size="lg"
            disabled={isGenerating}
          >
            <Plus className="mr-2 h-5 w-5" />
            Crear Otro Vale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
