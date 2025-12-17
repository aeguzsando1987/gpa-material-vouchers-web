'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { useCreateUserWithIndividual, useRoles } from '@/hooks/useUsers';
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

const userCreateSchema = z.object({
  // Datos del usuario
  user_email: z.string().email('Email inválido').min(1, 'Email requerido'),
  user_name: z.string().min(3, 'Nombre de usuario debe tener al menos 3 caracteres'),
  user_password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  user_role: z.number().min(1).max(6),

  // Datos del individuo
  name: z.string().min(2, 'Nombre requerido'),
  last_name: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type UserCreateFormData = z.infer<typeof userCreateSchema>;

export default function UserCreateForm() {
  const router = useRouter();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const createUser = useCreateUserWithIndividual();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      user_role: 4, // Default: Lector
    },
  });

  const selectedRole = watch('user_role');

  const onSubmit = async (data: UserCreateFormData) => {
    try {
      await createUser.mutateAsync(data);
      router.push('/admin/users');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
          <CardDescription>
            Información para iniciar sesión en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_email">Email de Usuario *</Label>
              <Input
                id="user_email"
                type="email"
                placeholder="usuario@empresa.com"
                {...register('user_email')}
              />
              {errors.user_email && (
                <p className="text-sm text-red-500">{errors.user_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_name">Nombre de Usuario *</Label>
              <Input
                id="user_name"
                placeholder="usuario123"
                {...register('user_name')}
              />
              {errors.user_name && (
                <p className="text-sm text-red-500">{errors.user_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_password">Contraseña *</Label>
              <Input
                id="user_password"
                type="password"
                placeholder="••••••••"
                {...register('user_password')}
              />
              {errors.user_password && (
                <p className="text-sm text-red-500">{errors.user_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_role">Rol del Usuario *</Label>
              <Select
                value={selectedRole?.toString()}
                onValueChange={(value) => setValue('user_role', parseInt(value))}
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
              {errors.user_role && (
                <p className="text-sm text-red-500">{errors.user_role.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos del Individuo */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>
            Información personal del individuo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Juan Carlos"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                placeholder="Pérez García"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de Contacto *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="5551234567"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Calle Principal 123, Ciudad"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
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
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Usuario'
          )}
        </Button>
      </div>
    </form>
  );
}
