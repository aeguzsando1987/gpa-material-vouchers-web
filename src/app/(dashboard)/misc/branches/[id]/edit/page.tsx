'use client';

import { useRouter, useParams } from 'next/navigation';
import { useBranch, useUpdateBranch } from '@/hooks/useBranches';
import { BranchUpdateInput } from '@/lib/types/branch';
import BranchForm from '@/components/forms/BranchForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = parseInt(params.id as string);

  const { data: branch, isLoading: loadingBranch } = useBranch(branchId);
  const updateBranchMutation = useUpdateBranch();

  const handleSubmit = async (data: BranchUpdateInput) => {
    await updateBranchMutation.mutateAsync({ id: branchId, data });
    router.push('/misc/branches');
  };

  if (loadingBranch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sucursal...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Sucursal no encontrada</p>
          <Button
            variant="outline"
            onClick={() => router.push('/misc/branches')}
            className="mt-4"
          >
            Volver a sucursales
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
          onClick={() => router.push('/misc/branches')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a sucursales
        </Button>
      </div>

      {/* Formulario */}
      <BranchForm
        branch={branch}
        onSubmit={handleSubmit}
        isLoading={updateBranchMutation.isPending}
      />
    </div>
  );
}
