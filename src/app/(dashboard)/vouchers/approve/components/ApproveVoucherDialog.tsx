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
import { useApproveVoucher } from '@/hooks/useVouchers';
import { Loader2 } from 'lucide-react';

const approveSchema = z.object({
  notes: z.string().optional(),
});

type ApproveFormData = z.infer<typeof approveSchema>;

interface ApproveVoucherDialogProps {
  voucherId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApproveVoucherDialog({
  voucherId,
  open,
  onOpenChange,
}: ApproveVoucherDialogProps) {
  const { mutate: approve, isPending } = useApproveVoucher();
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
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Aprobar Vale</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas aprobar este vale? Esta acción no se puede deshacer.
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
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aprobar Vale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
