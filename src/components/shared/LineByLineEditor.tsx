'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { VoucherDetail } from '@/lib/types/voucher';

export interface LineValidation {
  detail_id: number;
  ok: boolean;
  notes?: string;
}

interface LineByLineEditorProps {
  details: VoucherDetail[];
  onValidationsChange: (validations: LineValidation[]) => void;
  mode: 'exit' | 'entry';
  readOnly?: boolean;
  initialValidations?: LineValidation[];
}

export default function LineByLineEditor({
  details,
  onValidationsChange,
  mode,
  readOnly = false,
  initialValidations = [],
}: LineByLineEditorProps) {
  // Estado local de validaciones (mapa detail_id → validación)
  const [validations, setValidations] = useState<Record<number, LineValidation>>({});

  // Inicializar validaciones desde props
  useEffect(() => {
    if (initialValidations.length > 0) {
      const validationsMap: Record<number, LineValidation> = {};
      initialValidations.forEach((v) => {
        validationsMap[v.detail_id] = v;
      });
      setValidations(validationsMap);
    }
  }, [initialValidations]);

  // Notificar cambios al padre
  useEffect(() => {
    const validationsList = Object.values(validations);
    onValidationsChange(validationsList);
  }, [validations, onValidationsChange]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = details.length;
    const validated = Object.keys(validations).length;
    const allOk = Object.values(validations).every((v) => v.ok === true);
    const withProblems = Object.values(validations).filter((v) => v.ok === false).length;

    return { total, validated, allOk, withProblems };
  }, [details.length, validations]);

  // Manejar cambio de checkbox "OK"
  const handleOkChange = (detailId: number, checked: boolean) => {
    setValidations((prev) => ({
      ...prev,
      [detailId]: {
        detail_id: detailId,
        ok: checked,
        notes: checked ? undefined : prev[detailId]?.notes, // Limpiar notas si se marca OK
      },
    }));
  };

  // Manejar cambio de notas
  const handleNotesChange = (detailId: number, notes: string) => {
    setValidations((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        detail_id: detailId,
        ok: prev[detailId]?.ok ?? false,
        notes: notes || undefined,
      },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Encabezado con estadísticas */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Validación Visual por Línea
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant={stats.validated === stats.total ? 'default' : 'secondary'}>
            {stats.validated}/{stats.total} validadas
          </Badge>
          {stats.withProblems > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertCircle className="mr-1 h-3 w-3" />
              {stats.withProblems} con observaciones
            </Badge>
          )}
        </div>
      </div>

      {/* Tabla de validación */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Artículo</TableHead>
              <TableHead className="w-32 text-center">Cantidad</TableHead>
              <TableHead className="w-24 text-center">
                OK {mode === 'exit' ? 'Salida' : 'Entrada'}
              </TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay líneas de detalle
                </TableCell>
              </TableRow>
            ) : (
              details.map((detail) => {
                const validation = validations[detail.id];
                const isValidated = validation !== undefined;
                const isOk = validation?.ok ?? false;

                return (
                  <TableRow
                    key={detail.id}
                    className={
                      isValidated
                        ? isOk
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : 'bg-amber-50 dark:bg-amber-950/20'
                        : ''
                    }
                  >
                    {/* Línea */}
                    <TableCell className="text-center font-medium">
                      {detail.line_number}
                    </TableCell>

                    {/* Artículo */}
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

                    {/* Cantidad */}
                    <TableCell className="text-center">
                      <div className="font-medium">
                        {detail.quantity} {detail.unit_of_measure}
                      </div>
                    </TableCell>

                    {/* Checkbox OK */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {isValidated && isOk && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        )}
                        {isValidated && !isOk && (
                          <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                        )}
                        <Checkbox
                          checked={isOk}
                          onCheckedChange={(checked) =>
                            handleOkChange(detail.id, checked === true)
                          }
                          disabled={readOnly}
                        />
                      </div>
                    </TableCell>

                    {/* Observaciones */}
                    <TableCell>
                      <Input
                        type="text"
                        placeholder={
                          !isValidated
                            ? 'Validar primero...'
                            : isOk
                            ? 'Sin observaciones'
                            : 'Especificar problema...'
                        }
                        value={validation?.notes ?? ''}
                        onChange={(e) => handleNotesChange(detail.id, e.target.value)}
                        disabled={readOnly || !isValidated || isOk}
                        className={
                          !isOk && isValidated && mode === 'entry' && !validation?.notes
                            ? 'border-amber-500'
                            : ''
                        }
                      />
                      {!isOk && isValidated && mode === 'entry' && !validation?.notes && (
                        <p className="text-xs text-amber-600 mt-1">
                          Recomendado: agregar observaciones
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumen informativo */}
      <div className="text-sm text-muted-foreground">
        {mode === 'exit' ? (
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span>
              <strong>Modo flexible:</strong> El material SIEMPRE sale. Las observaciones se
              documentan pero no bloquean la salida.
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>
              <strong>Modo registro:</strong> La entrada SIEMPRE se registra. Si hay líneas con
              problemas, el vale cambiará a INCOMPLETE_DAMAGED.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
