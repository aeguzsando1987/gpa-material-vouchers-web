'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Loader2, Building2 } from 'lucide-react';

import { useCreateUserWithIndividual, useRoles } from '@/hooks/useUsers';
import { useCompanies } from '@/hooks/useCompanies';
import { useIndividuals } from '@/hooks/useIndividuals';
import { useAuthStore } from '@/lib/store/authStore';
import { individualService } from '@/lib/api/services/individualService';
import { MultiSelect } from '@/components/ui/multi-select';
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
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 1;

  // Estado para campos de empresa (fuera del schema Zod para mayor flexibilidad)
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [allowedCompanyIds, setAllowedCompanyIds] = useState<number[]>([]);

  // Estado para jerarquía organizacional
  const [directSupervisorId, setDirectSupervisorId] = useState<number | undefined>(undefined);
  const [ioManagerId, setIoManagerId] = useState<number | undefined>(undefined);

  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(1, 100, true);
  const { data: allIndividuals = [] } = useIndividuals(0, 200, true);
  const companies = companiesData?.data || [];

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
      const payload: any = { ...data };
      if (isAdmin && companyId) {
        payload.company_id = companyId;
        payload.allowed_company_ids = allowedCompanyIds;
      }
      const result = await createUser.mutateAsync(payload);

      // Si se seleccionó jerarquía, actualizar el individual recién creado
      if ((directSupervisorId || ioManagerId) && result?.individual?.id) {
        await individualService.update(result.individual.id, {
          direct_supervisor_id: directSupervisorId ?? null,
          io_manager_id: ioManagerId ?? null,
        });
      }

      router.push('/admin/users');
    } catch (error) {
      // Error handled by hook
    }
  };

  const companyOptions = Array.isArray(companies)
    ? companies.map((c: any) => ({ value: c.id, label: c.company_name || c.name || `Empresa ${c.id}` }))
    : [];

  const allowedCompanyOptions = companyOptions.filter((c) => c.value !== companyId);

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

      {/* Configuración de Empresa — SOLO ADMIN */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Configuración de Empresa
            </CardTitle>
            <CardDescription>
              Asigna la empresa principal y las empresas adicionales que este usuario puede gestionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa Principal */}
              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa Principal</Label>
                <Select
                  value={companyId?.toString() ?? ''}
                  onValueChange={(val) => {
                    const id = parseInt(val);
                    setCompanyId(id);
                    // Quitar la empresa principal de allowed si estaba
                    setAllowedCompanyIds((prev) => prev.filter((c) => c !== id));
                  }}
                  disabled={loadingCompanies}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companyOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value.toString()}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Empresa a la que pertenece el empleado
                </p>
              </div>

              {/* Empresas Adicionales */}
              <div className="space-y-2">
                <Label>Empresas Adicionales</Label>
                <MultiSelect
                  value={allowedCompanyIds}
                  onChange={setAllowedCompanyIds}
                  options={allowedCompanyOptions}
                  placeholder="Selecciona empresas adicionales..."
                  disabled={loadingCompanies}
                />
                <p className="text-xs text-muted-foreground">
                  Empresas adicionales que puede gestionar (opcional)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jerarquía Organizacional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Jerarquía Organizacional
          </CardTitle>
          <CardDescription>
            Define quién es el jefe directo y el encargado de entradas/salidas.
            Estos datos se usan para el envío automático de correos al crear vales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jefe Directo</Label>
              <Select
                value={directSupervisorId?.toString() ?? ''}
                onValueChange={(val) => setDirectSupervisorId(val ? parseInt(val) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin jefe directo asignado" />
                </SelectTrigger>
                <SelectContent>
                  {allIndividuals.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id.toString()}>
                      {ind.name} {ind.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Recibe copia del correo al crear un vale</p>
            </div>

            <div className="space-y-2">
              <Label>Encargado de Entradas/Salidas</Label>
              <Select
                value={ioManagerId?.toString() ?? ''}
                onValueChange={(val) => setIoManagerId(val ? parseInt(val) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin encargado asignado" />
                </SelectTrigger>
                <SelectContent>
                  {allIndividuals.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id.toString()}>
                      {ind.name} {ind.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Recibe copia del correo al crear un vale (por defecto: Hocejo)</p>
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
