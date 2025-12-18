'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import ProductSelector from '@/components/shared/ProductSelector';
import { ProductSearchResult } from '@/lib/types/product';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

import { ProductCategory } from '@/lib/types/product';

// Tipo para línea de detalle (en memoria, sin IDs de BD)
export interface VoucherDetailDraft {
  line_number: number;
  product_id?: number; // ID del producto seleccionado del cache (opcional)
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_of_measure: string;
  serial_number?: string;
  part_number?: string;
  category?: ProductCategory; // Categoría para manual entry
  notes?: string;
}

interface VoucherDetailsEditorProps {
  details: VoucherDetailDraft[];
  onChange: (details: VoucherDetailDraft[]) => void;
  readOnly?: boolean; // Modo solo lectura (sin editar/eliminar/agregar)
}

const detailSchema = z.object({
  product_id: z.number().optional(), // ID del producto seleccionado del cache
  item_name: z.string().min(1, 'Nombre del artículo requerido').max(200),
  item_description: z.string().max(500).optional(),
  quantity: z.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  unit_of_measure: z.string().min(1, 'Unidad de medida requerida'),
  serial_number: z.string().max(100).optional(),
  part_number: z.string().max(100).optional(),
  category: z.nativeEnum(ProductCategory).optional(), // Categoría para manual entry
  notes: z.string().max(500).optional(),
});

type DetailFormData = z.infer<typeof detailSchema>;

export default function VoucherDetailsEditor({ details, onChange, readOnly = false }: VoucherDetailsEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingLine, setEditingLine] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<DetailFormData>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      quantity: 1,
      unit_of_measure: 'PZA',
    },
  });

  // Watch product_id to conditionally show category selector
  const currentProductId = watch('product_id');

  // Calcular siguiente número de línea disponible
  const getNextAvailableLineNumber = (): number => {
    if (details.length === 0) return 1;

    const existingLineNumbers = details.map(d => d.line_number).sort((a, b) => a - b);

    for (let i = 1; i <= 20; i++) {
      if (!existingLineNumbers.includes(i)) {
        return i;
      }
    }

    return 21; // Máximo alcanzado
  };

  // Agregar nueva línea
  const handleAddDetail = (data: DetailFormData) => {
    const lineNumber = getNextAvailableLineNumber();

    const newDetail: VoucherDetailDraft = {
      line_number: lineNumber,
      product_id: data.product_id, // ✅ Pasar product_id si existe
      item_name: data.item_name,
      item_description: data.item_description || undefined,
      quantity: data.quantity,
      unit_of_measure: data.unit_of_measure,
      serial_number: data.serial_number || undefined,
      part_number: data.part_number || undefined,
      category: data.category || undefined, // ✅ Incluir categoría
      notes: data.notes || undefined,
    };

    console.log('📝 DEBUG: Adding new detail line:', newDetail);
    console.log('📝 DEBUG: Current details before add:', details);
    const updatedDetails = [...details, newDetail];
    console.log('📝 DEBUG: Updated details after add:', updatedDetails);

    onChange(updatedDetails);
    reset();
    setShowForm(false);
  };

  // Actualizar línea existente
  const handleUpdateDetail = (data: DetailFormData) => {
    if (editingLine === null) return;

    const updatedDetails = details.map(d =>
      d.line_number === editingLine
        ? {
            ...d,
            product_id: data.product_id, // ✅ Actualizar product_id si existe
            item_name: data.item_name,
            item_description: data.item_description || undefined,
            quantity: data.quantity,
            unit_of_measure: data.unit_of_measure,
            serial_number: data.serial_number || undefined,
            part_number: data.part_number || undefined,
            category: data.category || undefined, // ✅ Incluir categoría
            notes: data.notes || undefined,
          }
        : d
    );

    onChange(updatedDetails);
    setEditingLine(null);
    reset();
  };

  // Eliminar línea
  const handleDeleteDetail = (lineNumber: number) => {
    console.log('🗑️ DEBUG: Deleting line number:', lineNumber);
    console.log('🗑️ DEBUG: Details before delete:', details);
    const updatedDetails = details.filter(d => d.line_number !== lineNumber);
    console.log('🗑️ DEBUG: Details after delete:', updatedDetails);
    onChange(updatedDetails);
  };

  // Iniciar edición
  const startEditing = (detail: VoucherDetailDraft) => {
    setEditingLine(detail.line_number);
    setShowForm(false);
    reset({
      item_name: detail.item_name,
      item_description: detail.item_description || '',
      quantity: detail.quantity,
      unit_of_measure: detail.unit_of_measure,
      serial_number: detail.serial_number || '',
      part_number: detail.part_number || '',
      notes: detail.notes || '',
    });
  };

  // Cancelar edición/agregado
  const handleCancel = () => {
    setShowForm(false);
    setEditingLine(null);
    reset();
  };

  // Manejar selección de producto desde cache
  const handleProductSelect = (product: ProductSearchResult) => {
    console.log('🔍 DEBUG: Product selected:', product);

    // Obtener valores actuales del formulario
    const currentValues = getValues();
    console.log('📋 DEBUG: Current form values:', currentValues);

    // Hacer reset con valores actuales + datos del producto
    // Esto asegura que el DOM se actualice correctamente
    reset({
      ...currentValues,
      product_id: product.id, // ✅ CLAVE: Pasar ID del producto al backend
      item_name: product.name,
      item_description: product.description || currentValues.item_description || '',
      unit_of_measure: product.unit_of_measure,
      part_number: product.part_number || currentValues.part_number || '', // ✅ FIX: Usar part_number correcto
      category: product.category || currentValues.category, // Autocompletar categoría
    });

    console.log('✅ DEBUG: Form reset with product data. Product ID:', product.id);
  };

  // Manejar tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(editingLine !== null ? handleUpdateDetail : handleAddDetail)();
    }
  };

  const canAddMore = details.length < 20;
  const nextLineNumber = getNextAvailableLineNumber();
  const sortedDetails = [...details].sort((a, b) => a.line_number - b.line_number);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Líneas de Detalle</CardTitle>
            <CardDescription>
              Agrega los artículos o materiales incluidos en este vale (máximo 20 líneas)
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {details.length} / 20 líneas
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabla de líneas */}
        {details.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-24">Unidad</TableHead>
                  {!readOnly && <TableHead className="w-24">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDetails.map((detail) => (
                  <TableRow key={detail.line_number}>
                    <TableCell className="font-medium">{detail.line_number}</TableCell>
                    <TableCell>{detail.item_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {detail.item_description || '-'}
                    </TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>{detail.unit_of_measure}</TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(detail)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar línea?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará la línea #{detail.line_number}: {detail.item_name}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDetail(detail.line_number)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Formulario de agregar/editar */}
        {!readOnly && (showForm || editingLine !== null) && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {editingLine !== null
                  ? `Editar línea #${editingLine}`
                  : `Nueva línea #${nextLineNumber}`}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Selector de productos del cache */}
            <div className="mb-4">
              <ProductSelector
                onSelect={handleProductSelect}
                label="Buscar en Productos Registrados (opcional)"
                placeholder="Busca un producto por código o nombre..."
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                💡 Selecciona un producto del catálogo para autocompletar los campos, o escríbelos manualmente abajo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del artículo */}
              <div className="space-y-2">
                <Label htmlFor="item_name">Nombre del Artículo *</Label>
                <Input
                  id="item_name"
                  {...register('item_name')}
                  placeholder="Ej: Martillo, Cable eléctrico, etc."
                  onKeyDown={handleKeyDown}
                />
                {errors.item_name && (
                  <p className="text-sm text-red-500">{errors.item_name.message}</p>
                )}
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  {...register('quantity', { valueAsNumber: true })}
                  onKeyDown={handleKeyDown}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity.message}</p>
                )}
              </div>

              {/* Unidad de medida */}
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unidad de Medida *</Label>
                <Input
                  id="unit_of_measure"
                  {...register('unit_of_measure')}
                  placeholder="PZA, M, KG, etc."
                  onKeyDown={handleKeyDown}
                />
                {errors.unit_of_measure && (
                  <p className="text-sm text-red-500">{errors.unit_of_measure.message}</p>
                )}
              </div>

              {/* Número de serie */}
              <div className="space-y-2">
                <Label htmlFor="serial_number">Número de Serie (opcional)</Label>
                <Input
                  id="serial_number"
                  {...register('serial_number')}
                  placeholder="SN-12345"
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Número de parte */}
              <div className="space-y-2">
                <Label htmlFor="part_number">Número de Parte (opcional)</Label>
                <Input
                  id="part_number"
                  {...register('part_number')}
                  placeholder="PN-ABC123"
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Categoría - Solo mostrar cuando NO hay producto seleccionado (entrada manual) */}
              {!currentProductId && (
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Categoría *
                    <span className="text-xs text-muted-foreground ml-2">
                      (Solo para entrada manual)
                    </span>
                  </Label>
                  <Select
                    value={watch('category') || ''}
                    onValueChange={(value) => {
                      const formValues = getValues();
                      reset({
                        ...formValues,
                        category: value as ProductCategory,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductCategory.TOOL}>Herramienta</SelectItem>
                      <SelectItem value={ProductCategory.MACHINE}>Máquina</SelectItem>
                      <SelectItem value={ProductCategory.COMPUTER_EQUIPMENT}>Equipo de Cómputo</SelectItem>
                      <SelectItem value={ProductCategory.FINISHED_PRODUCT}>Producto Terminado</SelectItem>
                      <SelectItem value={ProductCategory.RAW_MATERIAL}>Materia Prima</SelectItem>
                      <SelectItem value={ProductCategory.SPARE_PART}>Refacción</SelectItem>
                      <SelectItem value={ProductCategory.CONSUMABLE}>Consumible</SelectItem>
                      <SelectItem value={ProductCategory.OTHER}>Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              )}

              {/* Descripción */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="item_description">Descripción (opcional)</Label>
                <Textarea
                  id="item_description"
                  {...register('item_description')}
                  placeholder="Descripción detallada del artículo..."
                  rows={2}
                />
              </div>

              {/* Notas */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(editingLine !== null ? handleUpdateDetail : handleAddDetail)}
              >
                <Check className="mr-2 h-4 w-4" />
                {editingLine !== null ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </div>
        )}

        {/* Botón para mostrar formulario de nueva línea */}
        {!readOnly && !showForm && editingLine === null && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(true)}
            disabled={!canAddMore}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {canAddMore
              ? `Agregar línea ${details.length > 0 ? `(${details.length}/20)` : ''}`
              : 'Máximo de líneas alcanzado (20/20)'}
          </Button>
        )}

        {details.length === 0 && !showForm && !readOnly && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay líneas agregadas. Haz clic en &quot;Agregar línea&quot; para comenzar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
