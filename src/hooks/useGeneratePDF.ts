import { useState } from 'react';
import { voucherPdfService } from '@/lib/api/services/voucherPdfService';
import toast from 'react-hot-toast';

interface GeneratePDFResult {
  generateAndDownload: (voucherId: number, voucherFolio: string) => Promise<boolean>;
  isGenerating: boolean;
  progress: string;
}

/**
 * Hook para generar y descargar PDFs de vouchers
 * Maneja el flujo completo: generación asíncrona → polling → descarga
 */
export const useGeneratePDF = (): GeneratePDFResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const generateAndDownload = async (
    voucherId: number,
    voucherFolio: string
  ): Promise<boolean> => {
    setIsGenerating(true);
    setProgress('Iniciando generación de PDF...');

    try {
      // Paso 1: Iniciar generación asíncrona
      const { task_id } = await voucherPdfService.generatePDF(voucherId);
      setProgress('Generando PDF...');

      // Paso 2: Polling cada 2 segundos (máximo 10 intentos = 20 segundos)
      let attempts = 0;
      const maxAttempts = 10;

      const checkStatus = async (): Promise<boolean> => {
        attempts++;
        const statusData = await voucherPdfService.getTaskStatus(task_id);

        if (statusData.status === 'SUCCESS') {
          setProgress('PDF generado, descargando...');
          return true;
        } else if (statusData.status === 'FAILURE') {
          throw new Error(statusData.message || 'Error al generar PDF');
        } else if (attempts >= maxAttempts) {
          throw new Error('Tiempo de espera agotado. Intenta nuevamente.');
        }

        // Esperar 2 segundos antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkStatus();
      };

      await checkStatus();

      // Paso 3: Descargar PDF como blob (incluye token de autenticación en headers)
      setProgress('Descargando PDF...');
      const blob = await voucherPdfService.downloadPDF(voucherId);

      // Crear URL temporal del blob y abrirlo en nueva pestaña
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL temporal después de un momento
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success('PDF generado exitosamente');
      setProgress('');
      return true;
    } catch (error: any) {
      const message =
        error.response?.data?.detail || error.message || 'Error al generar PDF';
      toast.error(message);
      setProgress('');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAndDownload,
    isGenerating,
    progress,
  };
};
