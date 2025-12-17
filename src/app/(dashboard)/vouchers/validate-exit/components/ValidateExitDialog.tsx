'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { VoucherWithDetails } from '@/lib/types/voucher';
import LineByLineEditor, { LineValidation } from '@/components/shared/LineByLineEditor';

interface ValidateExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherWithDetails;
  onConfirm: (data: ValidateExitFormData) => void;
  isPending: boolean;
}

export interface ValidateExitFormData {
  line_validations: LineValidation[];
  general_observations?: string;
}

const validateExitSchema = z.object({
  line_validations: z
    .array(
      z.object({
        detail_id: z.number().positive(),
        ok: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Debe validar al menos una línea'),
  general_observations: z.string().max(2000).optional(),
});

export default function ValidateExitDialog({
  open,
  onOpenChange,
  voucher,
  onConfirm,
  isPending,
}: ValidateExitDialogProps) {
  const [lineValidations, setLineValidations] = useState<LineValidation[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ValidateExitFormData>({
    resolver: zodResolver(validateExitSchema),
    defaultValues: {
      line_validations: [],
      general_observations: '',
    },
  });

  // Manejar cambios del LineByLineEditor (memorizado para evitar loops)
  const handleValidationsChange = useCallback((validations: LineValidation[]) => {
    setLineValidations(validations);
    setValue('line_validations', validations, { shouldValidate: true });
  }, [setValue]);

  // Estadísticas de validación
  const stats = useMemo(() => {
    const total = voucher.details?.length || 0;
    const validated = lineValidations.length;
    const allOk = lineValidations.every((v) => v.ok === true);
    const withProblems = lineValidations.filter((v) => v.ok === false).length;
    const isComplete = validated === total;

    return { total, validated, allOk, withProblems, isComplete };
  }, [lineValidations, voucher.details]);

  // Determinar estado final del voucher
  const getResultingStatus = () => {
    if (voucher.with_return || voucher.is_intercompany) {
      return 'IN_TRANSIT';
    }
    return 'CLOSED';
  };

  // Verificar si el formulario es válido
  const isFormValid = useMemo(() => {
    return stats.isComplete;
  }, [stats.isComplete]);

  // Manejar submit
  const onSubmit = (data: ValidateExitFormData) => {
    onConfirm(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Validar Salida de Material
          </DialogTitle>
          <DialogDescription>
            Valida visualmente cada artículo antes de autorizar la salida.
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {' '}
              El material SIEMPRE saldrá incluso si hay observaciones.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del vale */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vale</p>
                <p className="font-bold text-lg">{voucher.folio}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tipo de Salida</p>
                <p className="font-medium">
                  {voucher.is_intercompany
                    ? 'Intercompañía'
                    : voucher.with_return
                    ? 'Con Retorno'
                    : 'Sin Retorno'}
                </p>
              </div>
            </div>
          </div>

          {/* Validación línea por línea */}
          <div className="space-y-2">
            <LineByLineEditor
              details={voucher.details || []}
              onValidationsChange={handleValidationsChange}
              mode="exit"
            />
            {errors.line_validations && (
              <p className="text-sm text-red-500">{errors.line_validations.message}</p>
            )}
          </div>

          {/* Observaciones generales */}
          <div className="space-y-2">
            <Label htmlFor="general_observations">Observaciones Generales (Opcional)</Label>
            <Textarea
              id="general_observations"
              {...register('general_observations')}
              placeholder="Agrega observaciones generales sobre la validación de salida..."
              rows={3}
              disabled={isPending}
              className="resize-none"
            />
            {errors.general_observations && (
              <p className="text-sm text-red-500">{errors.general_observations.message}</p>
            )}
          </div>

          {/* Resumen de validación */}
          <Alert variant={stats.allOk ? 'default' : 'default'} className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className={`h-4 w-4 ${stats.allOk ? 'text-green-600' : 'text-amber-600'}`} />
            <AlertTitle className="font-semibold">
              {stats.allOk
                ? 'Todas las líneas validadas OK'
                : `${stats.withProblems} línea(s) con observaciones`}
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p>
                  {stats.allOk
                    ? 'El material saldrá sin observaciones.'
                    : 'Se registrarán las observaciones pero el material SIEMPRE saldrá.'}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Estado actual: APPROVED</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-blue-600 dark:text-blue-400">
                    Nuevo estado: {getResultingStatus()}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Footer con botones */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isFormValid}
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Procesando...' : 'Autorizar Salida'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
