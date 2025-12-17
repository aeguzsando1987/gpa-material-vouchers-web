'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { useUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserEditForm from '@/components/forms/UserEditForm';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              No se pudo cargar el usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              El usuario no existe o no tienes permisos para verlo.
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                Volver a Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
          <p className="text-muted-foreground">
            {user.name} ({user.email})
          </p>
        </div>
      </div>

      {/* Form */}
      <UserEditForm user={user} />
    </div>
  );
}
