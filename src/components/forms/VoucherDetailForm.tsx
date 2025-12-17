'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useCreateVoucherDetail } from '@/hooks/useVoucherDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COMMON_UNITS, DEFAULT_UNIT_OF_MEASURE } from '@/lib/types/voucherDetail';

const voucherDetailSchema = z.object({
  item_name: z.string().min(1, 'Nombre del artículo requerido').max(200),
  item_description: z.string().max(500).optional(),
  quantity: z.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  unit_of_measure: z.string().min(1, 'Unidad de medida requerida'),
  serial_number: z.string().max(100).optional(),
  part_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type VoucherDetailFormData = z.infer<typeof voucherDetailSchema>;

interface VoucherDetailFormProps {
  voucherId: number;
  lineNumber: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VoucherDetailForm({
  voucherId,
  lineNumber,
  onSuccess,
  onCancel,
}: VoucherDetailFormProps) {
  const createDetail = useCreateVoucherDetail();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherDetailFormData>({
    resolver: zodResolver(voucherDetailSchema),
    defaultValues: {
      unit_of_measure: DEFAULT_UNIT_OF_MEASURE,
      quantity: 1,
    },
  });

  const selectedUnit = watch('unit_of_measure');

  const onSubmit = async (data: VoucherDetailFormData) => {
    try {
      await createDetail.mutateAsync({
        voucher_id: voucherId,
        line_number: lineNumber,
        item_name: data.item_name,
        item_description: data.item_description,
        quantity: data.quantity,
        unit_of_measure: data.unit_of_measure || DEFAULT_UNIT_OF_MEASURE,
        serial_number: data.serial_number,
        part_number: data.part_number,
        notes: data.notes,
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Línea #{lineNumber}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Artículo */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="item_name">Nombre del Artículo *</Label>
          <Input
            id="item_name"
            type="text"
            placeholder="Ej: Tornillo hexagonal..."
            {...register('item_name')}
          />
          {errors.item_name && (
            <p className="text-sm text-red-500">{errors.item_name.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="item_description">Descripción (opcional)</Label>
          <Textarea
            id="item_description"
            placeholder="Detalles adicionales del artículo..."
            rows={2}
            {...register('item_description')}
          />
          {errors.item_description && (
            <p className="text-sm text-red-500">{errors.item_description.message}</p>
          )}
        </div>

        {/* Cantidad */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            {...register('quantity', { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
        </div>

        {/* Unidad de Medida */}
        <div className="space-y-2">
          <Label htmlFor="unit_of_measure">Unidad de Medida *</Label>
          <Select
            value={selectedUnit}
            onValueChange={(value) => setValue('unit_of_measure', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona unidad" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit_of_measure && (
            <p className="text-sm text-red-500">{errors.unit_of_measure.message}</p>
          )}
        </div>

        {/* Número de Serie */}
        <div className="space-y-2">
          <Label htmlFor="serial_number">Número de Serie (opcional)</Label>
          <Input
            id="serial_number"
            type="text"
            placeholder="S/N..."
            {...register('serial_number')}
          />
          {errors.serial_number && (
            <p className="text-sm text-red-500">{errors.serial_number.message}</p>
          )}
        </div>

        {/* Número de Parte */}
        <div className="space-y-2">
          <Label htmlFor="part_number">Número de Parte (opcional)</Label>
          <Input
            id="part_number"
            type="text"
            placeholder="P/N..."
            {...register('part_number')}
          />
          {errors.part_number && (
            <p className="text-sm text-red-500">{errors.part_number.message}</p>
          )}
        </div>

        {/* Notas */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Observaciones adicionales..."
            rows={2}
            {...register('notes')}
          />
          {errors.notes && (
            <p className="text-sm text-red-500">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={createDetail.isPending}>
          {createDetail.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Línea'
          )}
        </Button>
      </div>
    </form>
  );
}