'use client';

import { useRouter } from 'next/navigation';
import { useCreateCompany } from '@/hooks/useCompanies';
import { CompanyCreateInput, CompanyUpdateInput } from '@/lib/types/company';
import CompanyForm from '@/components/forms/CompanyForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateCompanyPage() {
  const router = useRouter();
  const createCompanyMutation = useCreateCompany();

  const handleSubmit = async (data: CompanyCreateInput | CompanyUpdateInput) => {
    await createCompanyMutation.mutateAsync(data as CompanyCreateInput);
    router.push('/misc/companies');
  };

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
        onSubmit={handleSubmit}
        isLoading={createCompanyMutation.isPending}
      />
    </div>
  );
}
