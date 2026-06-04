'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Save, RotateCcw, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import VoucherLinesTable from './VoucherLinesTable';
import {
  useVoucherDetails,
  useCreateVoucherDetail,
  useUpdateVoucherDetail,
  useDeleteVoucherDetail,
} from '@/hooks/useVoucherDetails';
import { VoucherDetail, VoucherDetailDraft } from '@/lib/types/voucherDetail';
import { ProductCategory } from '@/lib/types/product';
import { Button } from '@/components/ui/button';

interface VoucherDetailsManagerProps {
  voucherId: number;
  canEdit: boolean;
}

// Mapea una línea del backend a draft.
// - quantity llega como Decimal serializado en string ("1.00") → lo pasamos a número.
// - la categoría no es campo de la línea: el backend la expone como product_category.
// - normalizamos opcionales vacíos a undefined para que el diff (isDirty/modified)
//   coincida con lo que emite la tabla y no marque líneas como cambiadas sin serlo.
const toDraft = (detail: VoucherDetail): VoucherDetailDraft => ({
  line_number: detail.line_number,
  product_id: detail.product_id,
  item_name: detail.item_name,
  item_description: detail.item_description || undefined,
  quantity: Number(detail.quantity),
  unit_of_measure: detail.unit_of_measure,
  serial_number: detail.serial_number || undefined,
  part_number: detail.part_number || undefined,
  category: detail.product_category
    ? (detail.product_category as ProductCategory)
    : undefined,
  notes: detail.notes || undefined,
});

/**
 * Conecta la tabla de líneas (VoucherLinesTable) con el backend.
 *
 * La tabla edita en estado LOCAL (emite onChange por cada cambio). La
 * persistencia NO es por tecla: se ejecuta al pulsar "Guardar cambios",
 * calculando el diff (altas/bajas/modificaciones) contra lo que hay en backend.
 */
export default function VoucherDetailsManager({ voucherId, canEdit }: VoucherDetailsManagerProps) {
  const { data: backendDetails, isLoading } = useVoucherDetails(voucherId);
  const createDetail = useCreateVoucherDetail();
  const updateDetail = useUpdateVoucherDetail();
  const deleteDetail = useDeleteVoucherDetail();

  const [draftDetails, setDraftDetails] = useState<VoucherDetailDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  // Por defecto la tabla se ve en modo consulta; se edita al pulsar "Editar líneas".
  const [isEditing, setIsEditing] = useState(false);

  // Baseline = estado actual en backend (para diff y para detectar cambios).
  const baseline = useMemo<VoucherDetailDraft[]>(
    () => (backendDetails ?? []).map(toDraft),
    [backendDetails]
  );
  // line_number → id de BD, para saber qué líneas ya existen.
  const lineIdMap = useMemo(() => {
    const map = new Map<number, number>();
    (backendDetails ?? []).forEach((d) => map.set(d.line_number, d.id));
    return map;
  }, [backendDetails]);

  // Adoptar el estado de backend cuando carga/cambia (p. ej. tras guardar y refetch).
  useEffect(() => {
    setDraftDetails(baseline);
  }, [baseline]);

  const isDirty = JSON.stringify(draftDetails) !== JSON.stringify(baseline);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const draftLineNumbers = new Set(draftDetails.map((d) => d.line_number));

      const added = draftDetails.filter((d) => !lineIdMap.has(d.line_number));
      const deleted = baseline.filter((d) => !draftLineNumbers.has(d.line_number));
      const modified = draftDetails.filter((d) => {
        if (!lineIdMap.has(d.line_number)) return false;
        const old = baseline.find((b) => b.line_number === d.line_number);
        return old && JSON.stringify(old) !== JSON.stringify(d);
      });

      // Validación de cliente: evitar 422 del backend (quantity > 0) con un aviso claro.
      const invalid = [...added, ...modified].filter(
        (d) => !(typeof d.quantity === 'number' && d.quantity > 0)
      );
      if (invalid.length > 0) {
        const lines = invalid.map((d) => d.line_number).join(', ');
        toast.error(`La cantidad debe ser mayor a 0 en la(s) línea(s): ${lines}.`);
        return;
      }

      // 1) Bajas
      for (const d of deleted) {
        const id = lineIdMap.get(d.line_number);
        if (id) await deleteDetail.mutateAsync({ id, voucherId });
      }
      // 2) Altas (el hook envía skip_similarity_search cuando no hay product_id)
      for (const d of added) {
        await createDetail.mutateAsync({
          voucher_id: voucherId,
          line_number: d.line_number,
          product_id: d.product_id,
          item_name: d.item_name,
          item_description: d.item_description,
          quantity: d.quantity,
          unit_of_measure: d.unit_of_measure,
          serial_number: d.serial_number,
          part_number: d.part_number,
          category: d.category,
          notes: d.notes,
        });
      }
      // 3) Modificaciones
      for (const d of modified) {
        const id = lineIdMap.get(d.line_number);
        if (!id) continue;
        await updateDetail.mutateAsync({
          id,
          voucherId,
          data: {
            item_name: d.item_name,
            item_description: d.item_description,
            quantity: d.quantity,
            unit_of_measure: d.unit_of_measure,
            serial_number: d.serial_number,
            part_number: d.part_number,
            notes: d.notes,
          },
        });
      }

      if (added.length + deleted.length + modified.length === 0) {
        toast('No hay cambios que guardar');
      }
      // El refetch (invalidación de los hooks) re-sincroniza baseline y draft.
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edición: descartar cambios locales y volver a consulta.
  const handleCancelEdit = () => {
    setDraftDetails(baseline);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Este vale ya no puede modificarse (estado aprobado o en proceso). Se muestran sus
            líneas en modo consulta.
          </p>
        </div>
      )}

      <VoucherLinesTable
        details={draftDetails}
        onChange={setDraftDetails}
        disabled={!canEdit || !isEditing}
      />

      {canEdit && !isEditing && (
        <div className="flex items-center justify-end">
          <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar líneas
          </Button>
        </div>
      )}

      {canEdit && isEditing && (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
