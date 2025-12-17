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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { VoucherWithDetails } from '@/lib/types/voucher';
import LineByLineEditor, { LineValidation } from '@/components/shared/LineByLineEditor';

interface ConfirmEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherWithDetails;
  onConfirm: (data: ConfirmEntryFormData) => void;
  isPending: boolean;
}

export interface ConfirmEntryFormData {
  line_validations: LineValidation[];
  general_observations?: string;
}

const confirmEntrySchema = z.object({
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

export default function ConfirmEntryDialog({
  open,
  onOpenChange,
  voucher,
  onConfirm,
  isPending,
}: ConfirmEntryDialogProps) {
  const [lineValidations, setLineValidations] = useState<LineValidation[]>([]);
  const [showConfirmProblemsDialog, setShowConfirmProblemsDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ConfirmEntryFormData>({
    resolver: zodResolver(confirmEntrySchema),
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

  // Determinar estado resultante del voucher (LÓGICA ESTRICTA)
  const getResultingStatus = () => {
    if (!stats.isComplete) return null;
    return stats.allOk ? 'CLOSED' : 'INCOMPLETE_DAMAGED';
  };

  // Verificar si el formulario es válido
  const isFormValid = useMemo(() => {
    return stats.isComplete;
  }, [stats.isComplete]);

  // Manejar submit con confirmación si hay problemas
  const onSubmit = (data: ConfirmEntryFormData) => {
    const resultingStatus = getResultingStatus();

    // Si hay problemas, mostrar confirmación adicional
    if (resultingStatus === 'INCOMPLETE_DAMAGED') {
      setShowConfirmProblemsDialog(true);
    } else {
      // Si todo está OK, confirmar directamente
      onConfirm(data);
    }
  };

  // Confirmar definitivamente después de la alerta
  const handleConfirmWithProblems = () => {
    const data = {
      line_validations: lineValidations,
      general_observations: watch('general_observations'),
    };
    setShowConfirmProblemsDialog(false);
    onConfirm(data);
  };

  const resultingStatus = getResultingStatus();

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Confirmar Entrada de Material
          </DialogTitle>
          <DialogDescription>
            Valida visualmente cada artículo al recibirlo.
            <span className="font-semibold text-red-600 dark:text-red-400">
              {' '}
              El vale SOLO cerrará si TODAS las líneas están OK.
            </span>{' '}
            Si hay problemas, se marcará como INCOMPLETE_DAMAGED.
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
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {voucher.voucher_type === 'ENTRY'
                    ? 'Solo Entrada'
                    : voucher.is_intercompany
                    ? 'Intercompañía'
                    : voucher.with_return
                    ? 'Con Retorno'
                    : 'Sin Retorno'}
                </p>
              </div>
            </div>
          </div>

          {/* Validación línea por línea - MODO ESTRICTO */}
          <div className="space-y-2">
            <LineByLineEditor
              details={voucher.details || []}
              onValidationsChange={handleValidationsChange}
              mode="entry"
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
              placeholder="Agrega observaciones generales sobre la recepción del material..."
              rows={3}
              disabled={isPending}
              className="resize-none"
            />
            {errors.general_observations && (
              <p className="text-sm text-red-500">{errors.general_observations.message}</p>
            )}
          </div>

          {/* Alertas diferenciadas según resultado - LÓGICA ESTRICTA */}
          {stats.isComplete && resultingStatus === 'CLOSED' && (
            <Alert variant="default" className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="font-semibold text-green-700">
                Entrada Completa
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <p>Todas las líneas validadas OK. El material se recibe en perfecto estado.</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Estado actual: {voucher.status}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-green-600 dark:text-green-400">
                      Nuevo estado: CLOSED
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {stats.isComplete && resultingStatus === 'INCOMPLETE_DAMAGED' && (
            <Alert variant="default" className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="font-semibold text-red-700">
                Entrada Incompleta/Dañada
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <p>
                    {stats.withProblems} línea(s) con problemas detectados.
                    El vale se marcará como INCOMPLETE_DAMAGED y requerirá seguimiento.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Estado actual: {voucher.status}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-red-600 dark:text-red-400">
                      Nuevo estado: INCOMPLETE_DAMAGED
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!stats.isComplete && (
            <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="font-semibold">
                Validación Pendiente
              </AlertTitle>
              <AlertDescription>
                <p>
                  Valida todas las líneas ({stats.validated}/{stats.total} validadas).
                  Debes revisar cada artículo antes de confirmar la entrada.
                </p>
              </AlertDescription>
            </Alert>
          )}

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
              {isPending ? 'Procesando...' : 'Confirmar Entrada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

      {/* AlertDialog de confirmación cuando hay problemas */}
      <AlertDialog open={showConfirmProblemsDialog} onOpenChange={setShowConfirmProblemsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Entrada con Problemas
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-2 px-6 pb-4">
            <div className="font-medium text-sm text-muted-foreground">
              Has detectado {stats.withProblems} línea(s) con problemas.
            </div>
            <div className="text-sm text-muted-foreground">
              Al confirmar, el vale se marcará como <span className="font-semibold text-red-600">INCOMPLETO/DAÑADO</span> y
              requerirá seguimiento posterior.
            </div>
            <div className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas continuar con esta confirmación?
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWithProblems}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, Confirmar con Problemas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
