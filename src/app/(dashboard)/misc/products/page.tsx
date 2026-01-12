'use client';

import { useState } from 'react';
import { useProductsPaginated } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductsTable from '@/components/products/ProductsTable';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState('usage_count');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const perPage = 20;

  const { data, isLoading, error } = useProductsPaginated(
    page,
    perPage,
    orderBy,
    orderDirection
  );

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data && page < data.total_pages) {
      setPage(page + 1);
    }
  };

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    setPage(1); // Reset a página 1 al cambiar ordenamiento
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cache de Productos
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Productos frecuentes para acelerar captura de vales
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Ordenar por:
              </label>
              <Select value={orderBy} onValueChange={handleOrderByChange}>
                <SelectTrigger className="w-[200px] bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="usage_count" className="text-gray-900">
                    Más Usados
                  </SelectItem>
                  <SelectItem value="name" className="text-gray-900">
                    Nombre
                  </SelectItem>
                  <SelectItem value="code" className="text-gray-900">
                    Código
                  </SelectItem>
                  <SelectItem value="category" className="text-gray-900">
                    Categoría
                  </SelectItem>
                  <SelectItem value="created_at" className="text-gray-900">
                    Fecha de Creación
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Dirección:
              </label>
              <Select
                value={orderDirection}
                onValueChange={(value: 'asc' | 'desc') => {
                  setOrderDirection(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="desc" className="text-gray-900">
                    Descendente
                  </SelectItem>
                  <SelectItem value="asc" className="text-gray-900">
                    Ascendente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error al cargar productos. Por favor, intente nuevamente.
              </p>
            </div>
          )}

          {/* Tabla */}
          {!isLoading && !error && data && (
            <>
              <ProductsTable products={data.products} />

              {/* Paginación */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando página {data.page} de {data.total_pages} (
                    {data.total} productos en total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={page >= data.total_pages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
