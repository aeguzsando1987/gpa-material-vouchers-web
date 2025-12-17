'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import UserCreateForm from '@/components/forms/UserCreateForm';

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Crea un nuevo usuario con su perfil de individuo
          </p>
        </div>
      </div>

      {/* Form */}
      <UserCreateForm />
    </div>
  );
}
