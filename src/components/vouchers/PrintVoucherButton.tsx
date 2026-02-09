'use client';

import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { useGeneratePDF } from '@/hooks/useGeneratePDF';

interface PrintVoucherButtonProps {
  voucherId: number;
  voucherFolio: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

/**
 * Botón reutilizable para imprimir vouchers
 * Maneja todo el flujo de generación y descarga de PDF
 */
export const PrintVoucherButton = ({
  voucherId,
  voucherFolio,
  variant = 'default',
  size = 'default',
  showLabel = true,
  className = '',
}: PrintVoucherButtonProps) => {
  const { generateAndDownload, isGenerating, progress } = useGeneratePDF();

  const handlePrint = async () => {
    await generateAndDownload(voucherId, voucherFolio);
  };

  return (
    <Button
      onClick={handlePrint}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && size !== 'icon' && (
            <span className="ml-2 text-sm">{progress}</span>
          )}
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          {showLabel && size !== 'icon' && <span className="ml-2">Imprimir</span>}
        </>
      )}
    </Button>
  );
};
