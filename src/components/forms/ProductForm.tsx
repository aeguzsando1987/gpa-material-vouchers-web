'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Product,
  ProductUpdatePayload,
  ProductCategory,
  PRODUCT_CATEGORY_NAMES,
} from '@/lib/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFormProps {
  product: Product; // Siempre requerido - solo modo edición
  onSubmit: (data: ProductUpdatePayload) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const router = useRouter();

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductUpdatePayload>({
    defaultValues: {
      code: product.code || '',
      name: product.name,
      description: product.description || '',
      part_number: product.part_number || '',
      category: product.category || ProductCategory.OTHER,
      unit_of_measure: product.unit_of_measure,
      is_serialized: product.is_serialized,
      is_active: product.is_active,
    },
  });

  // Watch fields for selects
  const selectedCategory = watch('category');
  const isSerialized = watch('is_serialized');
  const isActive = watch('is_active');

  const handleFormSubmit = (data: ProductUpdatePayload) => {
    // Limpiar campos opcionales vacíos
    const cleanedData = {
      ...data,
      code: data.code?.trim() || undefined,
      description: data.description?.trim() || undefined,
      part_number: data.part_number?.trim() || undefined,
    };
    onSubmit(cleanedData);
  };

  const handleCancel = () => {
    router.push('/misc/products');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            ID: {product.id} | Usado {product.usage_count} veces
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <Label htmlFor="code" className="text-gray-900">
                  Código
                </Label>
                <Input
                  id="code"
                  {...register('code', {
                    maxLength: {
                      value: 100,
                      message: 'Máximo 100 caracteres',
                    },
                  })}
                  placeholder="Ej: PROD-001"
                  className="bg-white text-gray-900"
                />
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="text-gray-900">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'El nombre es obligatorio',
                    minLength: {
                      value: 2,
                      message: 'Mínimo 2 caracteres',
                    },
                    maxLength: {
                      value: 300,
                      message: 'Máximo 300 caracteres',
                    },
                  })}
                  placeholder="Ej: Tornillo hexagonal M6"
                  className="bg-white text-gray-900"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="text-gray-900">
                Descripción
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del producto"
                className="bg-white text-gray-900"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Parte */}
              <div>
                <Label htmlFor="part_number" className="text-gray-900">
                  Número de Parte
                </Label>
                <Input
                  id="part_number"
                  {...register('part_number', {
                    maxLength: {
                      value: 100,
                      message: 'Máximo 100 caracteres',
                    },
                  })}
                  placeholder="Ej: PN-12345"
                  className="bg-white text-gray-900"
                />
                {errors.part_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.part_number.message}
                  </p>
                )}
              </div>

              {/* Unidad de Medida */}
              <div>
                <Label htmlFor="unit_of_measure" className="text-gray-900">
                  Unidad de Medida *
                </Label>
                <Input
                  id="unit_of_measure"
                  {...register('unit_of_measure', {
                    required: 'La unidad de medida es obligatoria',
                    maxLength: {
                      value: 20,
                      message: 'Máximo 20 caracteres',
                    },
                  })}
                  placeholder="Ej: PZA, KG, LT, M"
                  className="bg-white text-gray-900"
                />
                {errors.unit_of_measure && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.unit_of_measure.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Clasificación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Clasificación</h3>

            {/* Categoría */}
            <div>
              <Label htmlFor="category" className="text-gray-900">
                Categoría
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value as ProductCategory)}
              >
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Object.entries(PRODUCT_CATEGORY_NAMES).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-gray-900 hover:bg-gray-100"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Opciones</h3>

            <div className="space-y-3">
              {/* Serializado */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_serialized"
                  checked={isSerialized}
                  onCheckedChange={(checked) =>
                    setValue('is_serialized', checked as boolean)
                  }
                  className="border-gray-300"
                />
                <Label
                  htmlFor="is_serialized"
                  className="text-gray-900 cursor-pointer"
                >
                  Requiere número de serie
                </Label>
              </div>

              {/* Activo */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue('is_active', checked as boolean)
                  }
                  className="border-gray-300"
                />
                <Label
                  htmlFor="is_active"
                  className="text-gray-900 cursor-pointer"
                >
                  Producto activo
                </Label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Actualizar Producto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
