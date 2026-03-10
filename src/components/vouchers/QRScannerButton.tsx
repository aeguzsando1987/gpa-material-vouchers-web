'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface QRScannerButtonProps {
  onScan: (text: string) => void;
  disabled?: boolean;
  label?: string;
}

const QR_READER_ID = 'qr-reader-container';

export default function QRScannerButton({
  onScan,
  disabled = false,
  label = 'Escanear QR',
}: QRScannerButtonProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  // Iniciar escáner cuando el dialog abre
  useEffect(() => {
    if (!open) return;

    scannedRef.current = false;
    setError(null);

    // Pequeño delay para que el DOM esté listo
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  // Detener escáner cuando el dialog cierra
  useEffect(() => {
    if (!open) {
      stopScanner();
    }
  }, [open]);

  const startScanner = async () => {
    // Verificar que estamos en un contexto seguro (HTTPS o localhost)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError(
        'La cámara solo funciona en conexiones seguras (HTTPS). ' +
        'Actualmente estás en HTTP. Usa la búsqueda manual por folio.'
      );
      return;
    }

    try {
      const container = document.getElementById(QR_READER_ID);
      if (!container) return;

      html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID);
      setScanning(true);
      setError(null);

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera en móviles
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Evitar múltiples disparos
          if (scannedRef.current) return;
          scannedRef.current = true;

          stopScanner().then(() => {
            setOpen(false);
            onScan(decodedText);
          });
        },
        undefined // Error callback silencioso (normal al buscar QR)
      );
    } catch (err: any) {
      setScanning(false);
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setError('Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.');
      } else if (err?.message?.includes('No cameras found')) {
        setError('No se encontró cámara en este dispositivo.');
      } else {
        setError('No se pudo iniciar la cámara. Usa la búsqueda manual por folio.');
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        // Estado 2 = SCANNING, estado 3 = PAUSED
        if (state === 2 || state === 3) {
          await html5QrCodeRef.current.stop();
        }
      } catch {
        // Ignorar errores al detener
      } finally {
        html5QrCodeRef.current = null;
        setScanning(false);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear Código QR
            </DialogTitle>
            <DialogDescription>
              Apunta la cámara al código QR del vale impreso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error ? (
              /* Error de cámara */
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                <p className="font-medium mb-1">No se pudo acceder a la cámara</p>
                <p>{error}</p>
                <p className="mt-2 text-muted-foreground">
                  Puedes buscar el vale manualmente ingresando el folio en el campo de búsqueda.
                </p>
              </div>
            ) : (
              /* Contenedor del escáner */
              <div className="relative">
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">Iniciando cámara...</span>
                    </div>
                  </div>
                )}
                {/* El escáner se renderiza aquí */}
                <div
                  id={QR_READER_ID}
                  className="w-full rounded-lg overflow-hidden"
                  style={{ minHeight: '300px' }}
                />
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Marco visual del área de escaneo */}
                    <div className="w-48 h-48 border-2 border-white/80 rounded-lg shadow-lg" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
