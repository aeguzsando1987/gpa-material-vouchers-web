'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserCircle, Shield, Building2 } from 'lucide-react';

import { User } from '@/lib/types/user';
import { Individual } from '@/lib/types/individual';
import { useUpdateUser, useRoles } from '@/hooks/useUsers';
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
import toast from 'react-hot-toast';

const userEditSchema = z.object({
  // Datos del usuario
  email: z.string().email('Email inválido').optional(),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').optional(),
  password: z
    .string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.number().min(1).max(6).optional(),
  // Datos personales (Individual)
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional().or(z.literal('')),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserEditFormProps {
  user: User;
}

export default function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const updateUser = useUpdateUser();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 1;

  // Estado para el Individual asociado
  const [individual, setIndividual] = useState<Individual | null>(null);
  const [loadingIndividual, setLoadingIndividual] = useState(true);
  const [savingIndividual, setSavingIndividual] = useState(false);

  // Estado para campos de empresa (fuera del schema Zod)
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [allowedCompanyIds, setAllowedCompanyIds] = useState<number[]>([]);

  // Estado para jerarquía organizacional
  const [directSupervisorId, setDirectSupervisorId] = useState<number | undefined>(undefined);
  const [ioManagerId, setIoManagerId] = useState<number | undefined>(undefined);

  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(1, 100, true);
  const { data: allIndividuals = [] } = useIndividuals(0, 200, true);
  const companies = companiesData?.data || [];

  const companyOptions = Array.isArray(companies)
    ? companies.map((c: any) => ({ value: c.id, label: c.company_name || c.name || `Empresa ${c.id}` }))
    : [];

  const allowedCompanyOptions = companyOptions.filter((c) => c.value !== companyId);

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
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    },
  });

  const selectedRole = watch('role');

  // Cargar Individual asociado al usuario
  useEffect(() => {
    const fetchIndividual = async () => {
      try {
        setLoadingIndividual(true);
        const ind = await individualService.getByUserId(user.id);
        if (ind) {
          setIndividual(ind);
          setValue('firstName', ind.name || '');
          setValue('lastName', ind.last_name || '');
          setValue('phone', ind.phone || '');
          setValue('address', ind.address || '');

          // Pre-cargar campos de empresa si el individual tiene empresa asignada
          if ((ind as any).company_id) {
            setCompanyId((ind as any).company_id);
          }
          if ((ind as any).allowed_company_ids) {
            setAllowedCompanyIds((ind as any).allowed_company_ids || []);
          }

          // Pre-cargar jerarquía organizacional
          if (ind.direct_supervisor_id) setDirectSupervisorId(ind.direct_supervisor_id);
          if (ind.io_manager_id) setIoManagerId(ind.io_manager_id);
        }
      } catch (error) {
        // Usuario no tiene Individual asociado, es válido
        console.log('Usuario sin Individual asociado');
      } finally {
        setLoadingIndividual(false);
      }
    };

    fetchIndividual();
  }, [user.id, setValue]);

  // Actualizar campos del usuario cuando cambian los props
  useEffect(() => {
    setValue('email', user.email);
    setValue('name', user.name);
    setValue('role', user.role);
  }, [user, setValue]);

  const onSubmit = async (data: UserEditFormData) => {
    try {
      // 1. Actualizar datos del usuario
      const userUpdateData: Record<string, unknown> = {};
      if (data.email && data.email !== user.email) userUpdateData.email = data.email;
      if (data.name && data.name !== user.name) userUpdateData.name = data.name;
      if (data.password && data.password.length > 0) userUpdateData.password = data.password;
      if (data.role && data.role !== user.role) userUpdateData.role = data.role;

      if (Object.keys(userUpdateData).length > 0) {
        await updateUser.mutateAsync({ id: user.id, data: userUpdateData });
      }

      // 2. Crear o actualizar Individual (UPSERT)
      const hasPersonalData = data.firstName || data.lastName;

      if (hasPersonalData) {
        setSavingIndividual(true);

        if (individual) {
          // UPDATE: Individual existe, actualizar
          const individualUpdateData: Record<string, unknown> = {};
          if (data.firstName && data.firstName !== individual.name) {
            individualUpdateData.name = data.firstName;
          }
          if (data.lastName && data.lastName !== individual.last_name) {
            individualUpdateData.last_name = data.lastName;
          }
          if (data.phone !== individual.phone) {
            individualUpdateData.phone = data.phone || null;
          }
          if (data.address !== individual.address) {
            individualUpdateData.address = data.address || null;
          }

          // Campos de empresa (solo Admin)
          if (isAdmin) {
            if (companyId !== (individual as any).company_id) {
              individualUpdateData.company_id = companyId ?? undefined;
            }
            individualUpdateData.allowed_company_ids = allowedCompanyIds;
          }

          // Jerarquía organizacional
          individualUpdateData.direct_supervisor_id = directSupervisorId ?? null;
          individualUpdateData.io_manager_id = ioManagerId ?? null;

          if (Object.keys(individualUpdateData).length > 0) {
            await individualService.update(individual.id, individualUpdateData);
            toast.success('Datos personales actualizados');
          }
        } else {
          // CREATE: No existe Individual, crear uno nuevo
          if (data.firstName && data.lastName) {
            const createData: any = {
              name: data.firstName,
              last_name: data.lastName,
              email: data.email || user.email,
              phone: data.phone || undefined,
              address: data.address || undefined,
              user_id: user.id,
              status: 'active',
            };

            // Campos de empresa (solo Admin)
            if (isAdmin && companyId) {
              createData.company_id = companyId;
              createData.allowed_company_ids = allowedCompanyIds;
            }

            await individualService.create(createData);
            toast.success('Datos personales creados');
          }
        }

        setSavingIndividual(false);
      } else if (isAdmin && individual) {
        // Solo actualizar empresa si Admin cambió campos de empresa aunque no haya datos personales nuevos
        const companyChanged =
          companyId !== (individual as any).company_id ||
          JSON.stringify(allowedCompanyIds) !== JSON.stringify((individual as any).allowed_company_ids || []);

        if (companyChanged) {
          setSavingIndividual(true);
          await individualService.update(individual.id, {
            company_id: companyId ?? undefined,
            allowed_company_ids: allowedCompanyIds,
          });
          toast.success('Empresas actualizadas');
          setSavingIndividual(false);
        }
      }

      router.push('/admin/users');
    } catch (error: any) {
      setSavingIndividual(false);
      const detail = error?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : (typeof detail?.message === 'string' ? detail.message : null);
      toast.error(msg || 'Error al guardar los cambios');
    }
  };

  const isLoading = updateUser.isPending || savingIndividual;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datos de Cuenta
          </CardTitle>
          <CardDescription>
            Credenciales de acceso al sistema. Deja la contraseña en blanco para mantener la actual.
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
              <Label htmlFor="name">Nombre de Usuario</Label>
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

      {/* Datos Personales (Individual) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Datos Personales
            {!individual && !loadingIndividual && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Nuevo perfil)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {individual
              ? 'Información personal del usuario. Estos datos se utilizan en los vales.'
              : 'Este usuario no tiene datos personales. Completa los campos para crear su perfil.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingIndividual ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando datos personales...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre(s) {!individual && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="firstName"
                  placeholder="Juan Carlos"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellidos {!individual && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="lastName"
                  placeholder="Pérez García"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="555-123-4567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle Principal #123, Col. Centro"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>
          )}

          {!individual && !loadingIndividual && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              Este usuario necesita datos personales para poder crear y aprobar vales.
              Por favor, completa al menos el nombre y apellidos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Empresa — SOLO ADMIN */}
      {isAdmin && !loadingIndividual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Configuración de Empresa
            </CardTitle>
            <CardDescription>
              Asigna la empresa principal y las empresas adicionales que este usuario puede gestionar.
              {companyId && (
                <span className="block mt-1 text-blue-600 text-sm">
                  Empresa actual: {companyOptions.find((c) => c.value === companyId)?.label ?? `ID ${companyId}`}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa Principal */}
              <div className="space-y-2">
                <Label htmlFor="company_id_edit">Empresa Principal</Label>
                <Select
                  value={companyId?.toString() ?? ''}
                  onValueChange={(val) => {
                    const id = parseInt(val);
                    setCompanyId(id);
                    setAllowedCompanyIds((prev) => prev.filter((c) => c !== id));
                  }}
                  disabled={loadingCompanies}
                >
                  <SelectTrigger id="company_id_edit">
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

      {/* Jerarquía Organizacional — solo si tiene Individual */}
      {individual && !loadingIndividual && (
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
              {/* Jefe Directo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Jefe Directo</label>
                <Select
                  value={directSupervisorId?.toString() ?? ''}
                  onValueChange={(val) => setDirectSupervisorId(val ? parseInt(val) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin jefe directo asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    {allIndividuals
                      .filter((ind) => ind.id !== individual?.id)
                      .map((ind) => (
                        <SelectItem key={ind.id} value={ind.id.toString()}>
                          {ind.name} {ind.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recibe copia del correo al crear un vale
                </p>
              </div>

              {/* Encargado IO */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Encargado de Entradas/Salidas</label>
                <Select
                  value={ioManagerId?.toString() ?? ''}
                  onValueChange={(val) => setIoManagerId(val ? parseInt(val) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin encargado asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    {allIndividuals
                      .filter((ind) => ind.id !== individual?.id)
                      .map((ind) => (
                        <SelectItem key={ind.id} value={ind.id.toString()}>
                          {ind.name} {ind.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recibe copia del correo al crear un vale (por defecto: Hocejo)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/users')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
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
