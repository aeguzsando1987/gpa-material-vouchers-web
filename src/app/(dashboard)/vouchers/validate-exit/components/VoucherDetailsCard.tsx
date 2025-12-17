'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, MapPin, User, Calendar, FileText, Package } from 'lucide-react';
import { Voucher } from '@/lib/types/voucher';
import { format } from 'date-fns';

interface VoucherDetailsCardProps {
  voucher: Voucher;
}

export default function VoucherDetailsCard({ voucher }: VoucherDetailsCardProps) {
  // Determinar tipo de salida
  const getExitType = () => {
    if (voucher.is_intercompany) return 'Intercompañía';
    if (voucher.with_return) return 'Con Retorno';
    return 'Sin Retorno';
  };

  // Color del badge según tipo
  const getExitTypeBadge = () => {
    if (voucher.is_intercompany)
      return <Badge variant="secondary">Intercompañía</Badge>;
    if (voucher.with_return)
      return <Badge variant="default">Con Retorno</Badge>;
    return <Badge variant="outline">Sin Retorno</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              {voucher.folio}
            </CardTitle>
            <CardDescription className="mt-1">
              {voucher.company_name} •{' '}
              {format(new Date(voucher.created_at), "dd/MM/yyyy 'a las' HH:mm")}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge
              variant={voucher.status === 'APPROVED' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {voucher.status}
            </Badge>
            {getExitTypeBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información general del vale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Salida */}
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              Tipo de Salida
            </Label>
            <p className="font-medium">{getExitType()}</p>
          </div>

          {/* Entregado por */}
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Entregado por
            </Label>
            <p className="font-medium">{voucher.delivered_by_name || 'No especificado'}</p>
          </div>

          {/* Fecha estimada de retorno (si aplica) */}
          {voucher.with_return && voucher.estimated_return_date && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Fecha Estimada de Retorno
              </Label>
              <p className="font-medium">
                {format(new Date(voucher.estimated_return_date), 'dd/MM/yyyy')}
              </p>
            </div>
          )}

          {/* Aprobado por (si existe) */}
          {voucher.approved_by_name && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Aprobado por
              </Label>
              <p className="font-medium">{voucher.approved_by_name}</p>
            </div>
          )}

          {/* Sucursal origen (intercompañía) */}
          {voucher.is_intercompany && voucher.origin_branch_name && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Sucursal Origen
              </Label>
              <p className="font-medium">{voucher.origin_branch_name}</p>
            </div>
          )}

          {/* Sucursal destino (intercompañía) */}
          {voucher.is_intercompany && voucher.destination_branch_name && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Sucursal Destino
              </Label>
              <p className="font-medium">{voucher.destination_branch_name}</p>
            </div>
          )}

          {/* Destino externo (sin retorno, no intercompañía) */}
          {!voucher.is_intercompany && voucher.outer_destination && (
            <div className="space-y-1 md:col-span-2">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Destino Externo
              </Label>
              <p className="font-medium">{voucher.outer_destination}</p>
            </div>
          )}
        </div>

        {/* Notas del vale */}
        {voucher.notes && (
          <div className="space-y-1">
            <Label className="text-muted-foreground">Observaciones</Label>
            <p className="text-sm bg-muted p-3 rounded-md">{voucher.notes}</p>
          </div>
        )}

        {/* Detalles del vale (líneas de artículos) */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Artículos ({voucher.details?.length || 0} líneas)
          </Label>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="w-32 text-center">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!voucher.details || voucher.details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No hay líneas de detalle
                    </TableCell>
                  </TableRow>
                ) : (
                  voucher.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="text-center font-medium">
                        {detail.line_number}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{detail.item_name}</div>
                          {detail.item_description && (
                            <div className="text-sm text-muted-foreground">
                              {detail.item_description}
                            </div>
                          )}
                          {detail.serial_number && (
                            <div className="text-xs text-muted-foreground">
                              S/N: {detail.serial_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">
                          {detail.quantity} {detail.unit_of_measure}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
