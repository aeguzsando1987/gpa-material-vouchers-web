'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { User } from '@/lib/types/user';
import { useUpdateUser, useRoles } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const userEditSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').optional(),
  password: z
    .string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.number().min(1).max(6).optional(),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserEditFormProps {
  user: User;
}

export default function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
      role: user.role,
      password: '',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    setValue('email', user.email);
    setValue('name', user.name);
    setValue('role', user.role);
  }, [user, setValue]);

  const onSubmit = async (data: UserEditFormData) => {
    // Filtrar campos vacíos
    const updateData: any = {};
    if (data.email && data.email !== user.email) updateData.email = data.email;
    if (data.name && data.name !== user.name) updateData.name = data.name;
    if (data.password && data.password.length > 0) updateData.password = data.password;
    if (data.role && data.role !== user.role) updateData.role = data.role;

    if (Object.keys(updateData).length === 0) {
      router.push('/admin/users');
      return;
    }

    try {
      await updateUser.mutateAsync({ id: user.id, data: updateData });
      router.push('/admin/users');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>
            Modifica los datos del usuario. Deja la contraseña en blanco para mantener la actual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre de usuario"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Dejar en blanco para mantener la contraseña actual
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol del Usuario</Label>
              <Select
                value={selectedRole?.toString()}
                onValueChange={(value) => setValue('role', parseInt(value))}
                disabled={loadingRoles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}
