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
import { useApproveVoucher, useApproveIOVoucher } from '@/hooks/useVouchers';
import { Loader2 } from 'lucide-react';

const approveSchema = z.object({
  notes: z.string().optional(),
});

type ApproveFormData = z.infer<typeof approveSchema>;

interface ApproveVoucherDialogProps {
  voucherId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si es true, ejecuta la 2ª aprobación (contraloría) en vez de la 1ª. */
  io?: boolean;
}

export default function ApproveVoucherDialog({
  voucherId,
  open,
  onOpenChange,
  io = false,
}: ApproveVoucherDialogProps) {
  const approveLevel1 = useApproveVoucher();
  const approveIO = useApproveIOVoucher();
  const { mutate: approve, isPending } = io ? approveIO : approveLevel1;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
  });

  const onSubmit = (data: ApproveFormData) => {
    approve(
      {
        id: voucherId,
        data: data.notes ? { notes: data.notes } : undefined,
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
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            {io ? 'Aprobación de Contraloría' : 'Aprobar Vale'}
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            {io
              ? '¿Confirmas la segunda aprobación (contraloría)? El vale quedará APROBADO y listo para validación de salida. Esta acción no se puede deshacer.'
              : '¿Estás seguro de que deseas aprobar este vale? Pasará a Pendiente de Contraloría. Esta acción no se puede deshacer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Agrega notas o comentarios sobre la aprobación"
              rows={4}
              disabled={isPending}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer hover:bg-neutral-100 text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {io ? 'Aprobar Contraloría' : 'Aprobar Vale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
