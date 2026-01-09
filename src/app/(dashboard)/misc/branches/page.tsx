'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BranchesTable from '@/components/branches/BranchesTable';

export default function BranchesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const perPage = 20;

  const { data, isLoading, error } = useBranches(page, perPage, activeOnly);

  const handleCreateNew = () => {
    router.push('/misc/branches/create');
  };

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

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Gestión de Sucursales
            </CardTitle>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Sucursal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Filtro:
              </label>
              <Select
                value={activeOnly ? 'active' : 'all'}
                onValueChange={(value) => {
                  setActiveOnly(value === 'active');
                  setPage(1); // Reset a página 1 al cambiar filtro
                }}
              >
                <SelectTrigger className="w-[180px] bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active" className="text-gray-900">
                    Solo Activas
                  </SelectItem>
                  <SelectItem value="all" className="text-gray-900">
                    Mostrar Todas
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
                <p className="mt-4 text-gray-600">Cargando sucursales...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error al cargar sucursales. Por favor, intente nuevamente.
              </p>
            </div>
          )}

          {/* Tabla */}
          {!isLoading && !error && data && (
            <>
              <BranchesTable branches={data.data} />

              {/* Paginación */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando página {data.page} de {data.total_pages} (
                    {data.total} sucursales en total)
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
