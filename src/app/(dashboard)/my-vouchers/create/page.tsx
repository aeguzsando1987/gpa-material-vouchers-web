'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import VoucherCreateForm from '@/components/forms/VoucherCreateForm';

export default function CreateVoucherPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/my-vouchers">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Vale</h1>
          <p className="text-muted-foreground">
            Crea un nuevo vale de entrada o salida de material
          </p>
        </div>
      </div>

      {/* Form */}
      <VoucherCreateForm />
    </div>
  );
}
