'use client';

import { Trash2 } from 'lucide-react';
import { useDeleteVoucherDetail } from '@/hooks/useVoucherDetails';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VoucherDetail } from '@/lib/types/voucherDetail';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface VoucherDetailListProps {
  details: VoucherDetail[];
  voucherId: number;
  canEdit: boolean;
}

export default function VoucherDetailList({
  details,
  voucherId,
  canEdit,
}: VoucherDetailListProps) {
  const deleteDetail = useDeleteVoucherDetail();

  const handleDelete = async (detailId: number) => {
    try {
      await deleteDetail.mutateAsync({ id: detailId, voucherId });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Ordenar por line_number
  const sortedDetails = [...details].sort((a, b) => a.line_number - b.line_number);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Artículo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>N° Serie</TableHead>
            <TableHead>N° Parte</TableHead>
            {canEdit && <TableHead className="w-20">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDetails.map((detail) => (
            <TableRow key={detail.id}>
              <TableCell className="font-medium">{detail.line_number}</TableCell>
              <TableCell className="font-medium">{detail.item_name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {detail.item_description || '-'}
              </TableCell>
              <TableCell className="text-right">{detail.quantity}</TableCell>
              <TableCell>{detail.unit_of_measure}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {detail.serial_number || '-'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {detail.part_number || '-'}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar línea?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará la línea {detail.line_number}:{' '}
                          <strong>{detail.item_name}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(detail.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
