'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
  TaxSystem,
  CompanyStatus,
  TAX_SYSTEM_NAMES,
  COMPANY_STATUS_NAMES,
} from '@/lib/types/company';
import { useCountries } from '@/hooks/useCountries';
import { useStatesByCountry } from '@/hooks/useStates';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyFormProps {
  company?: Company; // Si existe, modo edición; si no, modo creación
  onSubmit: (data: CompanyCreateInput | CompanyUpdateInput) => void;
  isLoading?: boolean;
}

export default function CompanyForm({
  company,
  onSubmit,
  isLoading = false,
}: CompanyFormProps) {
  const router = useRouter();
  const isEditing = !!company;

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyCreateInput>({
    defaultValues: company
      ? {
          company_name: company.company_name,
          legal_name: company.legal_name || '',
          tin: company.tin,
          tax_system: company.tax_system,
          country_id: company.country_id,
          state_id: company.state_id || undefined,
          city: company.city || '',
          address: company.address || '',
          postal_code: company.postal_code || '',
          phone: company.phone || '',
          email: company.email || '',
          website: company.website || '',
          status: company.status,
        }
      : {
          company_name: '',
          legal_name: '',
          tin: '',
          tax_system: 'RFC' as TaxSystem, // Valor por defecto
          country_id: undefined as any,
          state_id: undefined,
          city: '',
          address: '',
          postal_code: '',
          phone: '',
          email: '',
          website: '',
          status: 'active' as CompanyStatus,
        },
  });

  // Watch country changes to load states
  const selectedCountryId = watch('country_id');
  const selectedTaxSystem = watch('tax_system');
  const selectedStatus = watch('status');

  // Queries
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const {
    data: states,
    isLoading: loadingStates,
  } = useStatesByCountry(selectedCountryId);

  // Reset state_id when country changes
  useEffect(() => {
    if (selectedCountryId && selectedCountryId !== company?.country_id) {
      setValue('state_id', undefined);
    }
  }, [selectedCountryId, company?.country_id, setValue]);

  const handleFormSubmit = (data: CompanyCreateInput) => {
    // Limpiar campos opcionales vacíos para que Pydantic no los rechace
    const cleanedData = {
      ...data,
      legal_name: data.legal_name?.trim() || undefined,
      state_id: data.state_id || undefined,
      city: data.city?.trim() || undefined,
      address: data.address?.trim() || undefined,
      postal_code: data.postal_code?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined, // ✅ Fix: string vacío → undefined
      website: data.website?.trim() || undefined,
    };
    onSubmit(cleanedData);
  };

  const handleCancel = () => {
    router.push('/misc/companies');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Empresa' : 'Nueva Empresa'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información General</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Comercial */}
              <div>
                <Label htmlFor="company_name" className="text-gray-900">
                  Nombre Comercial *
                </Label>
                <Input
                  id="company_name"
                  {...register('company_name', {
                    required: 'El nombre comercial es obligatorio',
                    minLength: {
                      value: 2,
                      message: 'Mínimo 2 caracteres',
                    },
                  })}
                  placeholder="Ej: ACME Corporation"
                  className="bg-white text-gray-900"
                />
                {errors.company_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.company_name.message}
                  </p>
                )}
              </div>

              {/* Razón Social */}
              <div>
                <Label htmlFor="legal_name" className="text-gray-900">
                  Razón Social
                </Label>
                <Input
                  id="legal_name"
                  {...register('legal_name')}
                  placeholder="Ej: ACME Corporation S.A. de C.V."
                  className="bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TIN */}
              <div>
                <Label htmlFor="tin" className="text-gray-900">
                  Número de Identificación Fiscal (TIN) *
                </Label>
                <Input
                  id="tin"
                  {...register('tin', {
                    required: 'El TIN es obligatorio',
                    minLength: {
                      value: 5,
                      message: 'Mínimo 5 caracteres',
                    },
                  })}
                  placeholder="Ej: RFC, EIN, NIF, etc."
                  className="bg-white text-gray-900"
                />
                {errors.tin && (
                  <p className="text-sm text-red-600 mt-1">{errors.tin.message}</p>
                )}
              </div>

              {/* Sistema Fiscal */}
              <div>
                <Label htmlFor="tax_system" className="text-gray-900">
                  Sistema Fiscal *
                </Label>
                <Select
                  value={selectedTaxSystem}
                  onValueChange={(value) => setValue('tax_system', value as TaxSystem)}
                >
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Seleccione sistema fiscal" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {Object.entries(TAX_SYSTEM_NAMES).map(([key, label]) => (
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
                {!selectedTaxSystem && (
                  <p className="text-sm text-red-600 mt-1">
                    El sistema fiscal es obligatorio
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>

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

              {/* Teléfono */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-gray-900">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contacto@empresa.com"
                  className="bg-white text-gray-900"
                />
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website" className="text-gray-900">
                  Sitio Web
                </Label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="www.empresa.com"
                  className="bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Estado Administrativo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado Administrativo</h3>

            <div className="w-full md:w-1/2">
              <Label htmlFor="status" className="text-gray-900">
                Estado
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as CompanyStatus)}
              >
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Object.entries(COMPANY_STATUS_NAMES).map(([key, label]) => (
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
              disabled={isLoading || !selectedTaxSystem || !selectedCountryId}
            >
              {isLoading
                ? 'Guardando...'
                : isEditing
                ? 'Actualizar Empresa'
                : 'Crear Empresa'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
