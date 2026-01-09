'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { CompanyUpdateInput } from '@/lib/types/company';
import CompanyForm from '@/components/forms/CompanyForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const { data: company, isLoading: loadingCompany } = useCompany(companyId);
  const updateCompanyMutation = useUpdateCompany();

  const handleSubmit = async (data: CompanyUpdateInput) => {
    await updateCompanyMutation.mutateAsync({ id: companyId, data });
    router.push('/misc/companies');
  };

  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empresa...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Empresa no encontrada</p>
          <Button
            variant="outline"
            onClick={() => router.push('/misc/companies')}
            className="mt-4"
          >
            Volver a empresas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/misc/companies')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a empresas
        </Button>
      </div>

      {/* Formulario */}
      <CompanyForm
        company={company}
        onSubmit={handleSubmit}
        isLoading={updateCompanyMutation.isPending}
      />
    </div>
  );
}
