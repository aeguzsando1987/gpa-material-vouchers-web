'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ProductCategory,
  ProductSearchResult,
  PRODUCT_CATEGORY_NAMES,
  getProductCategoryName,
} from '@/lib/types/product';
import {
  VoucherDetailDraft,
  MAX_DETAIL_LINES,
  DEFAULT_UNIT_OF_MEASURE,
  COMMON_UNITS,
} from '@/lib/types/voucherDetail';
import ProductAutocompleteCell from './ProductAutocompleteCell';

interface VoucherLinesTableProps {
  details: VoucherDetailDraft[];
  onChange: (details: VoucherDetailDraft[]) => void;
  maxLines?: number;
  /** true = solo lectura (oculta filas vacías). false = captura/edición (20 filas). */
  disabled?: boolean;
}

// Fila editable en memoria. Strings vacíos para que las filas no usadas se vean vacías.
interface Row {
  product_id?: number;
  item_name: string;
  item_description: string;
  quantity: number | '';
  unit_of_measure: string;
  serial_number: string;
  part_number: string;
  category: ProductCategory | '';
  notes: string;
}

const emptyRow = (): Row => ({
  product_id: undefined,
  item_name: '',
  item_description: '',
  quantity: '',
  unit_of_measure: '',
  serial_number: '',
  part_number: '',
  category: '',
  notes: '',
});

// Construye `maxLines` filas colocando cada detalle en su posición (line_number-1),
// respetando huecos. line_number fuera de rango se ignora.
const buildRows = (details: VoucherDetailDraft[], maxLines: number): Row[] => {
  const rows = Array.from({ length: maxLines }, emptyRow);
  for (const d of details) {
    const idx = d.line_number - 1;
    if (idx < 0 || idx >= maxLines) continue;
    // quantity puede llegar como número (estado local) o string "1.00" (Decimal del backend)
    const rawQty = d.quantity as number | string | null | undefined;
    const quantity =
      rawQty === null || rawQty === undefined || rawQty === '' ? '' : Number(rawQty);
    rows[idx] = {
      product_id: d.product_id,
      item_name: d.item_name ?? '',
      item_description: d.item_description ?? '',
      quantity: Number.isNaN(quantity as number) ? '' : quantity,
      unit_of_measure: d.unit_of_measure ?? '',
      serial_number: d.serial_number ?? '',
      part_number: d.part_number ?? '',
      category: (d.category as ProductCategory) ?? '',
      notes: d.notes ?? '',
    };
  }
  return rows;
};

// Convierte las filas con artículo en drafts (line_number = posición de la fila).
const rowsToDetails = (rows: Row[]): VoucherDetailDraft[] =>
  rows
    .map((row, idx) => ({ row, lineNumber: idx + 1 }))
    .filter(({ row }) => row.item_name.trim() !== '')
    .map(({ row, lineNumber }) => ({
      line_number: lineNumber,
      product_id: row.product_id,
      item_name: row.item_name.trim(),
      item_description: row.item_description.trim() || undefined,
      quantity: typeof row.quantity === 'number' ? row.quantity : Number(row.quantity) || 0,
      unit_of_measure: row.unit_of_measure || DEFAULT_UNIT_OF_MEASURE,
      serial_number: row.serial_number.trim() || undefined,
      part_number: row.part_number.trim() || undefined,
      category: row.category || undefined,
      notes: row.notes.trim() || undefined,
    }));

export default function VoucherLinesTable({
  details,
  onChange,
  maxLines = MAX_DETAIL_LINES,
  disabled = false,
}: VoucherLinesTableProps) {
  const [rows, setRows] = useState<Row[]>(() => buildRows(details, maxLines));

  // Firma de los detalles con los que el estado local ya está sincronizado.
  // Evita el bucle: cuando el `details` que llega es lo que nosotros emitimos, no reconstruimos.
  const [syncedSignature, setSyncedSignature] = useState<string>(() => JSON.stringify(details));

  // Re-derivar filas cuando `details` cambia por una causa externa (p. ej. el manager
  // carga las líneas del backend). Patrón recomendado de React de ajuste de estado en
  // render (https://react.dev/reference/react/useState#storing-information-from-previous-renders),
  // en lugar de un useEffect con setState (que dispara renders en cascada).
  const incomingSignature = JSON.stringify(details);
  if (incomingSignature !== syncedSignature) {
    setSyncedSignature(incomingSignature);
    setRows(buildRows(details, maxLines));
  }

  // Aplica un cambio local y emite hacia el padre solo las filas con artículo.
  const commit = (nextRows: Row[]) => {
    const emitted = rowsToDetails(nextRows);
    setRows(nextRows);
    // Marcamos la firma con lo emitido para no reconstruir por el eco del prop.
    setSyncedSignature(JSON.stringify(emitted));
    onChange(emitted);
  };

  const updateRow = (index: number, patch: Partial<Row>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    commit(next);
  };

  const clearRow = (index: number) => {
    const next = rows.map((r, i) => (i === index ? emptyRow() : r));
    commit(next);
  };

  const handleProductSelect = (index: number, product: ProductSearchResult) => {
    updateRow(index, {
      product_id: product.id,
      item_name: product.name,
      unit_of_measure: product.unit_of_measure || DEFAULT_UNIT_OF_MEASURE,
      part_number: product.part_number || '',
      category: product.category || '',
      item_description: product.description || '',
      // Si la cantidad estaba vacía, proponemos 1 al elegir un producto.
      quantity: rows[index].quantity === '' ? 1 : rows[index].quantity,
    });
  };

  const usedCount = rows.filter((r) => r.item_name.trim() !== '').length;

  // ----------------- MODO SOLO LECTURA (consulta): solo filas usadas -----------------
  if (disabled) {
    const used = rows
      .map((row, idx) => ({ row, lineNumber: idx + 1 }))
      .filter(({ row }) => row.item_name.trim() !== '');

    return (
      <Card>
        <CardHeader>
          <CardTitle>Líneas del vale</CardTitle>
          <CardDescription>
            {used.length} {used.length === 1 ? 'artículo' : 'artículos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {used.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Este vale no tiene líneas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Artículo</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>No. Serie</TableHead>
                    <TableHead>No. Parte</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {used.map(({ row, lineNumber }) => (
                    <TableRow key={lineNumber}>
                      <TableCell className="text-muted-foreground">{lineNumber}</TableCell>
                      <TableCell className="font-medium">{row.item_name}</TableCell>
                      <TableCell className="text-right">{row.quantity}</TableCell>
                      <TableCell>{row.unit_of_measure || DEFAULT_UNIT_OF_MEASURE}</TableCell>
                      <TableCell>{row.serial_number || '—'}</TableCell>
                      <TableCell>{row.part_number || '—'}</TableCell>
                      <TableCell>
                        {row.category ? getProductCategoryName(row.category) : '—'}
                      </TableCell>
                      <TableCell>{row.item_description || '—'}</TableCell>
                      <TableCell>{row.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ----------------- MODO CAPTURA / EDICIÓN: 20 filas editables -----------------
  return (
    <Card>
      <CardHeader>
        <CardTitle>Líneas del vale</CardTitle>
        <CardDescription>
          Captura los artículos directamente en la tabla. En la primera columna escribe el nombre:
          si existe en el catálogo aparecerá un desplegable para autollenar unidad, núm. de parte,
          categoría y descripción. {usedCount}/{maxLines} líneas usadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead className="min-w-[200px]">Artículo *</TableHead>
                <TableHead className="w-24">Cantidad *</TableHead>
                <TableHead className="w-28">Unidad</TableHead>
                <TableHead className="w-32">No. Serie</TableHead>
                <TableHead className="w-32">No. Parte</TableHead>
                <TableHead className="w-40">Categoría</TableHead>
                <TableHead className="min-w-[160px]">Descripción</TableHead>
                <TableHead className="min-w-[140px]">Nota</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                const hasName = row.item_name.trim() !== '';
                const invalidQty =
                  hasName && !(typeof row.quantity === 'number' && row.quantity > 0);
                return (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>

                    {/* 1. Artículo con autocompletado */}
                    <TableCell>
                      <ProductAutocompleteCell
                        value={row.item_name}
                        onChange={(value) =>
                          // Escribir a mano = entrada manual: limpiamos product_id.
                          updateRow(index, { item_name: value, product_id: undefined })
                        }
                        onSelectProduct={(product) => handleProductSelect(index, product)}
                      />
                    </TableCell>

                    {/* 2. Cantidad */}
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(index, {
                            quantity: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        className={`h-9 w-24 ${invalidQty ? 'border-red-500' : ''}`}
                      />
                    </TableCell>

                    {/* 3. Unidad de medida */}
                    <TableCell>
                      <input
                        list="voucher-units"
                        value={row.unit_of_measure}
                        placeholder={DEFAULT_UNIT_OF_MEASURE}
                        onChange={(e) => updateRow(index, { unit_of_measure: e.target.value })}
                        className="h-9 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </TableCell>

                    {/* 4. Número de serie */}
                    <TableCell>
                      <Input
                        value={row.serial_number}
                        onChange={(e) => updateRow(index, { serial_number: e.target.value })}
                        className="h-9 w-32"
                      />
                    </TableCell>

                    {/* 5. Número de parte */}
                    <TableCell>
                      <Input
                        value={row.part_number}
                        onChange={(e) => updateRow(index, { part_number: e.target.value })}
                        className="h-9 w-32"
                      />
                    </TableCell>

                    {/* 6. Categoría */}
                    <TableCell>
                      <select
                        value={row.category}
                        onChange={(e) =>
                          updateRow(index, {
                            category: (e.target.value as ProductCategory) || '',
                          })
                        }
                        className="h-9 w-40 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">—</option>
                        {Object.values(ProductCategory).map((cat) => (
                          <option key={cat} value={cat}>
                            {PRODUCT_CATEGORY_NAMES[cat]}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    {/* 7. Descripción */}
                    <TableCell>
                      <Input
                        value={row.item_description}
                        onChange={(e) => updateRow(index, { item_description: e.target.value })}
                        className="h-9 min-w-[160px]"
                      />
                    </TableCell>

                    {/* 8. Nota adicional */}
                    <TableCell>
                      <Input
                        value={row.notes}
                        onChange={(e) => updateRow(index, { notes: e.target.value })}
                        className="h-9 min-w-[140px]"
                      />
                    </TableCell>

                    {/* Limpiar fila */}
                    <TableCell>
                      {hasName && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                          onClick={() => clearRow(index)}
                          aria-label={`Limpiar línea ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Sugerencias de unidad reutilizando las unidades comunes del proyecto */}
          <datalist id="voucher-units">
            {COMMON_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </datalist>
        </div>
      </CardContent>
    </Card>
  );
}
