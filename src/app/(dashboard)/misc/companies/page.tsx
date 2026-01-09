'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuthStore } from '@/lib/store/authStore';
import CompaniesTable from '@/components/companies/CompaniesTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CompaniesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [activeOnly, setActiveOnly] = useState(true);

  // Query
  const {
    data: companiesData,
    isLoading,
    error,
  } = useCompanies(currentPage, perPage, activeOnly);

  // Permisos: Solo roles 1, 2, 3 pueden crear empresas
  const canCreate = user && [1, 2, 3].includes(user.role);

  const handleCreate = () => {
    router.push('/misc/companies/create');
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (companiesData && currentPage < companiesData.total_pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error al cargar empresas</p>
          <p className="text-gray-500 mt-2">
            {(error as any)?.response?.data?.detail || 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Gestión de Empresas
            </CardTitle>
            {canCreate && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Empresa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-48">
              <Label htmlFor="filter" className="text-gray-900">
                Filtro:
              </Label>
              <Select
                value={activeOnly ? 'active' : 'all'}
                onValueChange={(value) => {
                  setActiveOnly(value === 'active');
                  setCurrentPage(1); // Reset a primera página
                }}
              >
                <SelectTrigger id="filter" className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem
                    value="active"
                    className="text-gray-900 hover:bg-gray-100"
                  >
                    Solo Activas
                  </SelectItem>
                  <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">
                    Mostrar Todas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Información de paginación */}
            {companiesData && (
              <div className="flex-1 text-sm text-gray-600">
                Mostrando {companiesData.data.length} de {companiesData.total}{' '}
                empresa(s)
              </div>
            )}
          </div>

          {/* Tabla */}
          {companiesData && <CompaniesTable companies={companiesData.data} />}

          {/* Paginación */}
          {companiesData && companiesData.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {companiesData.total_pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === companiesData.total_pages}
                  className="gap-2"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
