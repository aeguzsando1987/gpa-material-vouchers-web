'use client';

import { useState, useEffect } from 'react';
import VoucherDetailsEditor, { VoucherDetailDraft } from './VoucherDetailsEditor';
import { useVoucherDetails, useCreateVoucherDetail, useUpdateVoucherDetail, useDeleteVoucherDetail } from '@/hooks/useVoucherDetails';
import { VoucherDetail } from '@/lib/types/voucherDetail';
import { Loader2 } from 'lucide-react';

interface VoucherDetailsManagerProps {
  voucherId: number;
  canEdit: boolean;
}

/**
 * Componente manager que conecta VoucherDetailsEditor con el backend.
 * Convierte detalles del backend (con IDs) a formato draft y sincroniza cambios.
 */
export default function VoucherDetailsManager({ voucherId, canEdit }: VoucherDetailsManagerProps) {
  const { data: backendDetails, isLoading } = useVoucherDetails(voucherId);
  const createDetail = useCreateVoucherDetail();
  const updateDetail = useUpdateVoucherDetail();
  const deleteDetail = useDeleteVoucherDetail();

  // Estado local de detalles en formato draft (sin IDs de BD)
  const [draftDetails, setDraftDetails] = useState<VoucherDetailDraft[]>([]);

  // Map para trackear qué líneas tienen ID en backend
  const [lineIdMap, setLineIdMap] = useState<Map<number, number>>(new Map());

  // Sincronizar detalles del backend a estado local
  useEffect(() => {
    if (backendDetails) {
      const drafts: VoucherDetailDraft[] = backendDetails.map((detail: VoucherDetail) => ({
        line_number: detail.line_number,
        product_id: detail.product_id,
        item_name: detail.item_name,
        item_description: detail.item_description,
        quantity: detail.quantity,
        unit_of_measure: detail.unit_of_measure,
        serial_number: detail.serial_number,
        part_number: detail.part_number,
        // category is not returned by backend, only used for creation
        notes: detail.notes,
      }));

      // Crear map de line_number → id
      const newMap = new Map<number, number>();
      backendDetails.forEach((detail: VoucherDetail) => {
        newMap.set(detail.line_number, detail.id);
      });

      setDraftDetails(drafts);
      setLineIdMap(newMap);
    }
  }, [backendDetails]);

  // Handler cuando el usuario modifica detalles en VoucherDetailsEditor
  const handleDetailsChange = async (newDetails: VoucherDetailDraft[]) => {
    // Detectar qué cambió
    const previousLineNumbers = new Set(draftDetails.map(d => d.line_number));
    const newLineNumbers = new Set(newDetails.map(d => d.line_number));

    // 1. Detectar líneas NUEVAS (no existen en backend)
    const addedLines = newDetails.filter(d => !lineIdMap.has(d.line_number));

    // 2. Detectar líneas ELIMINADAS
    const deletedLineNumbers = Array.from(previousLineNumbers).filter(ln => !newLineNumbers.has(ln));

    // 3. Detectar líneas MODIFICADAS (existen en backend y cambiaron)
    const modifiedLines = newDetails.filter(newDetail => {
      if (!lineIdMap.has(newDetail.line_number)) return false; // Es nueva, no modificada

      const oldDetail = draftDetails.find(d => d.line_number === newDetail.line_number);
      if (!oldDetail) return false;

      // Comparar si cambió algo
      return JSON.stringify(oldDetail) !== JSON.stringify(newDetail);
    });

    // NO actualizar estado local inmediatamente para evitar race conditions
    // Dejar que React Query refetch maneje la actualización después de cada operación

    // 4. Ejecutar operaciones en backend

    // 4.1. ELIMINAR líneas
    for (const lineNumber of deletedLineNumbers) {
      const detailId = lineIdMap.get(lineNumber);
      if (detailId) {
        try {
          await deleteDetail.mutateAsync({ id: detailId, voucherId });

          // Actualizar map
          const newMap = new Map(lineIdMap);
          newMap.delete(lineNumber);
          setLineIdMap(newMap);
        } catch (error) {
          console.error(`Error deleting line ${lineNumber}:`, error);
        }
      }
    }

    // 4.2. CREAR líneas nuevas
    for (const addedLine of addedLines) {
      try {
        const createdDetail = await createDetail.mutateAsync({
          voucher_id: voucherId,
          line_number: addedLine.line_number,
          product_id: addedLine.product_id,
          item_name: addedLine.item_name,
          item_description: addedLine.item_description,
          quantity: addedLine.quantity,
          unit_of_measure: addedLine.unit_of_measure,
          serial_number: addedLine.serial_number,
          part_number: addedLine.part_number,
          category: addedLine.category,
          notes: addedLine.notes,
        });

        // Agregar al map INMEDIATAMENTE
        const newMap = new Map(lineIdMap);
        newMap.set(addedLine.line_number, createdDetail.id);
        setLineIdMap(newMap);
      } catch (error) {
        console.error(`Error creating line ${addedLine.line_number}:`, error);
      }
    }

    // 4.3. ACTUALIZAR líneas modificadas
    for (const modifiedLine of modifiedLines) {
      const detailId = lineIdMap.get(modifiedLine.line_number);
      if (detailId) {
        try {
          await updateDetail.mutateAsync({
            id: detailId,
            voucherId,
            data: {
              item_name: modifiedLine.item_name,
              item_description: modifiedLine.item_description,
              quantity: modifiedLine.quantity,
              unit_of_measure: modifiedLine.unit_of_measure,
              serial_number: modifiedLine.serial_number,
              part_number: modifiedLine.part_number,
              notes: modifiedLine.notes,
            },
          });
        } catch (error) {
          console.error(`Error updating line ${modifiedLine.line_number}:`, error);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Este vale ya no puede ser modificado. Solo puedes ver las líneas de detalle.
        </p>
      </div>
    );
  }

  // OPCIÓN A: Deshabilitar edición si el vale ya tiene líneas existentes
  // Para evitar conflictos con line_number en el backend
  const hasExistingLines = backendDetails && backendDetails.length > 0;

  return (
    <div className="space-y-4">
      {hasExistingLines && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 font-medium mb-2">
            No es posible agregar o modificar líneas en vales que ya tienen detalles
          </p>
          <p className="text-sm text-amber-700">
            Si necesitas modificar este vale, debes eliminarlo completamente y crear uno nuevo.
            Esta es una limitación temporal del sistema debido a conflictos con el número de línea en la base de datos.
          </p>
        </div>
      )}

      <VoucherDetailsEditor
        details={draftDetails}
        onChange={handleDetailsChange}
        readOnly={hasExistingLines}
      />
    </div>
  );
}
