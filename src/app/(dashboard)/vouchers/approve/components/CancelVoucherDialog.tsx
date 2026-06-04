'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCancelVoucher } from '@/hooks/useVouchers';
import { Loader2, AlertCircle } from 'lucide-react';

const cancelSchema = z.object({
  cancellation_reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
});

type CancelFormData = z.infer<typeof cancelSchema>;

interface CancelVoucherDialogProps {
  voucherId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CancelVoucherDialog({
  voucherId,
  open,
  onOpenChange,
}: CancelVoucherDialogProps) {
  const { mutate: cancel, isPending } = useCancelVoucher();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
  });

  const onSubmit = (data: CancelFormData) => {
    cancel(
      {
        id: voucherId,
        data: data,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl font-semibold">
            <AlertCircle className="h-5 w-5" />
            Rechazar Vale
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Esta acción cancelará el vale de forma permanente. Debes proporcionar una razón válida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="cancellation_reason" className="text-neutral-700">
              Razón de Rechazo <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="cancellation_reason"
              {...register('cancellation_reason')}
              placeholder="Explica por qué se rechaza este vale (mínimo 10 caracteres)"
              rows={4}
              disabled={isPending}
              className={`resize-none ${errors.cancellation_reason ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.cancellation_reason && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cancellation_reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isPending}
              className="cursor-pointer hover:bg-neutral-100 text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rechazar Vale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
