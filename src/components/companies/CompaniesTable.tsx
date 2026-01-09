'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import {
  Company,
  getCompanyStatusName,
  getTaxSystemName,
} from '@/lib/types/company';
import { useDeleteCompany } from '@/hooks/useCompanies';
import { useCountries } from '@/hooks/useCountries';
import { useStates } from '@/hooks/useStates';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CompaniesTableProps {
  companies: Company[];
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
  const router = useRouter();
  const deleteCompanyMutation = useDeleteCompany();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Cargar países y estados para hacer lookup
  const { data: countries } = useCountries(0, 100, false);
  const { data: states } = useStates(0, 1000, false);

  // Helper functions para obtener nombres
  const getCountryName = (countryId: number) => {
    const country = countries?.find((c) => c.id === countryId);
    return country?.name || `País ID: ${countryId}`;
  };

  const getStateName = (stateId: number | undefined) => {
    if (!stateId) return '-';
    const state = states?.find((s) => s.id === stateId);
    return state?.name || `Estado ID: ${stateId}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'; // verde
      case 'inactive':
        return 'secondary'; // gris
      case 'suspended':
        return 'destructive'; // rojo
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/misc/companies/${id}/edit`);
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (companyToDelete) {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay empresas registradas</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-900 font-semibold">
                Nombre Comercial
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">TIN</TableHead>
              <TableHead className="text-gray-900 font-semibold">
                Sistema Fiscal
              </TableHead>
              <TableHead className="text-gray-900 font-semibold">País</TableHead>
              <TableHead className="text-gray-900 font-semibold">Estado/Provincia</TableHead>
              <TableHead className="text-gray-900 font-semibold">Estado Admin</TableHead>
              <TableHead className="text-gray-900 font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">
                  {company.company_name}
                  {company.legal_name && (
                    <div className="text-xs text-gray-500">{company.legal_name}</div>
                  )}
                </TableCell>
                <TableCell className="text-gray-700">{company.tin}</TableCell>
                <TableCell className="text-gray-700">
                  {getTaxSystemName(company.tax_system)}
                </TableCell>
                <TableCell className="text-gray-700">
                  {getCountryName(company.country_id)}
                </TableCell>
                <TableCell className="text-gray-700">
                  {getStateName(company.state_id)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(
                      company.status
                    )}`}
                  >
                    {getCompanyStatusName(company.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company.id)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(company)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              ¿Eliminar empresa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Está seguro de que desea eliminar la empresa{' '}
              <span className="font-semibold">
                {companyToDelete?.company_name}
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
