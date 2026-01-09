'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Branch,
  BranchCreateInput,
  BranchUpdateInput,
  BranchType,
  OperationalStatus,
  BRANCH_TYPE_NAMES,
  OPERATIONAL_STATUS_NAMES,
} from '@/lib/types/branch';
import { useCompanies } from '@/hooks/useCompanies';
import { useCountries } from '@/hooks/useCountries';
import { useStatesByCountry } from '@/hooks/useStates';
import { useIndividuals } from '@/hooks/useIndividuals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BranchFormProps {
  branch?: Branch; // Si existe, modo edición; si no, modo creación
  onSubmit: (data: BranchCreateInput | BranchUpdateInput) => void;
  isLoading?: boolean;
}

export default function BranchForm({
  branch,
  onSubmit,
  isLoading = false,
}: BranchFormProps) {
  const router = useRouter();
  const isEditing = !!branch;

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BranchCreateInput>({
    defaultValues: branch
      ? {
          branch_code: branch.branch_code,
          branch_name: branch.branch_name,
          branch_type: branch.branch_type,
          description: branch.description || '',
          company_id: branch.company_id,
          country_id: branch.country_id,
          state_id: branch.state_id || undefined,
          city: branch.city || '',
          address: branch.address || '',
          postal_code: branch.postal_code || '',
          phone: branch.phone || '',
          email: branch.email || '',
          manager_id: branch.manager_id || undefined,
          latitude: branch.latitude || '',
          longitude: branch.longitude || '',
          operational_status: branch.operational_status,
        }
      : {
          branch_code: '',
          branch_name: '',
          branch_type: 'warehouse' as BranchType, // Valor por defecto
          description: '',
          company_id: undefined as any,
          country_id: undefined as any,
          state_id: undefined,
          city: '',
          address: '',
          postal_code: '',
          phone: '',
          email: '',
          manager_id: undefined,
          latitude: '',
          longitude: '',
          operational_status: 'active' as OperationalStatus,
        },
  });

  // Watch fields for dynamic selects
  const selectedCountryId = watch('country_id');
  const selectedBranchType = watch('branch_type');
  const selectedCompanyId = watch('company_id');
  const selectedOperationalStatus = watch('operational_status');

  // Queries
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies();
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const {
    data: states,
    isLoading: loadingStates,
  } = useStatesByCountry(selectedCountryId);
  const { data: individuals, isLoading: loadingIndividuals } = useIndividuals();

  // Reset state_id when country changes
  useEffect(() => {
    if (selectedCountryId && selectedCountryId !== branch?.country_id) {
      setValue('state_id', undefined);
    }
  }, [selectedCountryId, branch?.country_id, setValue]);

  const handleFormSubmit = (data: BranchCreateInput) => {
    // Limpiar campos opcionales vacíos para que Pydantic no los rechace
    const cleanedData = {
      ...data,
      description: data.description?.trim() || undefined,
      state_id: data.state_id || undefined,
      city: data.city?.trim() || undefined,
      address: data.address?.trim() || undefined,
      postal_code: data.postal_code?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      manager_id: data.manager_id || undefined,
      latitude: data.latitude?.trim() || undefined,
      longitude: data.longitude?.trim() || undefined,
    };
    onSubmit(cleanedData);
  };

  const handleCancel = () => {
    router.push('/misc/branches');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código de Sucursal */}
              <div>
                <Label htmlFor="branch_code" className="text-gray-900">
                  Código de Sucursal *
                </Label>
                <Input
                  id="branch_code"
                  {...register('branch_code', {
                    required: 'El código es obligatorio',
                    minLength: {
                      value: 2,
                      message: 'Mínimo 2 caracteres',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Máximo 50 caracteres',
                    },
                  })}
                  placeholder="Ej: ALM-001"
                  className="bg-white text-gray-900"
                />
                {errors.branch_code && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.branch_code.message}
                  </p>
                )}
              </div>

              {/* Nombre de Sucursal */}
              <div>
                <Label htmlFor="branch_name" className="text-gray-900">
                  Nombre de Sucursal *
                </Label>
                <Input
                  id="branch_name"
                  {...register('branch_name', {
                    required: 'El nombre es obligatorio',
                    minLength: {
                      value: 3,
                      message: 'Mínimo 3 caracteres',
                    },
                    maxLength: {
                      value: 200,
                      message: 'Máximo 200 caracteres',
                    },
                  })}
                  placeholder="Ej: Almacén Central"
                  className="bg-white text-gray-900"
                />
                {errors.branch_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.branch_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Sucursal */}
              <div>
                <Label htmlFor="branch_type" className="text-gray-900">
                  Tipo de Sucursal *
                </Label>
                <Select
                  value={selectedBranchType}
                  onValueChange={(value) => setValue('branch_type', value as BranchType)}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {Object.entries(BRANCH_TYPE_NAMES).map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedBranchType && (
                  <p className="text-sm text-red-600 mt-1">
                    El tipo de sucursal es obligatorio
                  </p>
                )}
              </div>

              {/* Empresa */}
              <div>
                <Label htmlFor="company_id" className="text-gray-900">
                  Empresa *
                </Label>
                <Select
                  value={selectedCompanyId?.toString()}
                  onValueChange={(value) => setValue('company_id', parseInt(value))}
                  disabled={loadingCompanies}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {companiesData?.data.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCompanyId && (
                  <p className="text-sm text-red-600 mt-1">La empresa es obligatoria</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="text-gray-900">
                Descripción
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada de la sucursal"
                className="bg-white text-gray-900"
                rows={3}
              />
            </div>
          </div>

          {/* Ubicación Geográfica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ubicación Geográfica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* País */}
              <div>
                <Label htmlFor="country_id" className="text-gray-900">
                  País *
                </Label>
                <Select
                  value={selectedCountryId?.toString()}
                  onValueChange={(value) => setValue('country_id', parseInt(value))}
                  disabled={loadingCountries}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione país" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {countries?.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.id.toString()}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCountryId && (
                  <p className="text-sm text-red-600 mt-1">El país es obligatorio</p>
                )}
              </div>

              {/* Estado/Provincia */}
              <div>
                <Label htmlFor="state_id" className="text-gray-900">
                  Estado/Provincia
                </Label>
                <Select
                  value={watch('state_id')?.toString()}
                  onValueChange={(value) =>
                    setValue('state_id', value ? parseInt(value) : undefined)
                  }
                  disabled={!selectedCountryId || loadingStates}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {states?.map((state) => (
                      <SelectItem
                        key={state.id}
                        value={state.id.toString()}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ciudad */}
              <div>
                <Label htmlFor="city" className="text-gray-900">
                  Ciudad
                </Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Ej: Ciudad de México"
                  className="bg-white text-gray-900"
                />
              </div>

              {/* Código Postal */}
              <div>
                <Label htmlFor="postal_code" className="text-gray-900">
                  Código Postal
                </Label>
                <Input
                  id="postal_code"
                  {...register('postal_code')}
                  placeholder="Ej: 01234"
                  className="bg-white text-gray-900"
                />
              </div>

              {/* Teléfono (movido aquí desde sección Contacto) */}
              <div>
                <Label htmlFor="phone" className="text-gray-900">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Ej: +52 55 1234 5678"
                  className="bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <Label htmlFor="address" className="text-gray-900">
                Dirección
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Ej: Av. Principal #123, Col. Centro"
                className="bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-gray-900">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contacto@sucursal.com"
                  className="bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Gestión */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Gestión</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Responsable/Gerente */}
              <div>
                <Label htmlFor="manager_id" className="text-gray-900">
                  Responsable/Gerente
                </Label>
                <Select
                  value={watch('manager_id')?.toString()}
                  onValueChange={(value) =>
                    setValue('manager_id', value ? parseInt(value) : undefined)
                  }
                  disabled={loadingIndividuals}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione responsable" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {individuals?.map((individual) => (
                      <SelectItem
                        key={individual.id}
                        value={individual.id.toString()}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {individual.name} {individual.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado Operativo */}
              <div>
                <Label htmlFor="operational_status" className="text-gray-900">
                  Estado Operativo
                </Label>
                <Select
                  value={selectedOperationalStatus}
                  onValueChange={(value) =>
                    setValue('operational_status', value as OperationalStatus)
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {Object.entries(OPERATIONAL_STATUS_NAMES).map(([key, label]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Coordenadas GPS (opcional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Coordenadas GPS (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Latitud */}
              <div>
                <Label htmlFor="latitude" className="text-gray-900">
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  {...register('latitude')}
                  placeholder="Ej: 19.432608"
                  className="bg-white text-gray-900"
                />
              </div>

              {/* Longitud */}
              <div>
                <Label htmlFor="longitude" className="text-gray-900">
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  {...register('longitude')}
                  placeholder="Ej: -99.133209"
                  className="bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedBranchType || !selectedCompanyId || !selectedCountryId}
            >
              {isLoading
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar Sucursal'
                : 'Crear Sucursal'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
