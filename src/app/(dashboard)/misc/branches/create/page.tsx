'use client';

import { useRouter } from 'next/navigation';
import { useCreateBranch } from '@/hooks/useBranches';
import { BranchCreateInput } from '@/lib/types/branch';
import BranchForm from '@/components/forms/BranchForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateBranchPage() {
  const router = useRouter();
  const createBranchMutation = useCreateBranch();

  const handleSubmit = async (data: BranchCreateInput) => {
    await createBranchMutation.mutateAsync(data);
    router.push('/misc/branches');
  };

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
        onSubmit={handleSubmit}
        isLoading={createBranchMutation.isPending}
      />
    </div>
  );
}
