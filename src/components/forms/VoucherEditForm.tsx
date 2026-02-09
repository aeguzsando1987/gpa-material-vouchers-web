'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { useUpdateVoucher } from '@/hooks/useVouchers';
import { useCompanies } from '@/hooks/useCompanies';
import { useBranches } from '@/hooks/useBranches';
import { parseLocalDate } from '@/lib/utils/dateHelpers';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Voucher } from '@/lib/types/voucher';

const voucherEditSchema = z.object({
  form_voucher_type: z.enum(['ENTRY', 'EXIT_WITH_RETURN', 'EXIT_WITHOUT_RETURN'] as const),
  company_id: z.number().min(1, 'Empresa requerida'),
  origin_branch_id: z.number().optional(),
  destination_branch_id: z.number().optional(),
  outer_destination: z.string().optional(),
  is_intercompany: z.boolean(),
  estimated_return_date: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
}).refine((data) => {
  // Si es EXIT_WITH_RETURN, estimated_return_date es obligatorio
  if (data.form_voucher_type === 'EXIT_WITH_RETURN' && !data.estimated_return_date) {
    return false;
  }
  return true;
}, {
  message: 'Fecha de retorno estimada requerida para salida con retorno',
  path: ['estimated_return_date'],
}).refine((data) => {
  // Si estimated_return_date existe, debe ser fecha futura o igual
  if (data.estimated_return_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = parseLocalDate(data.estimated_return_date);
    if (returnDate < today) {
      return false;
    }
  }
  return true;
}, {
  message: 'La fecha de retorno no puede ser anterior a hoy',
  path: ['estimated_return_date'],
});

type VoucherEditFormData = z.infer<typeof voucherEditSchema>;

interface VoucherEditFormProps {
  voucher: Voucher;
}

export default function VoucherEditForm({ voucher }: VoucherEditFormProps) {
  const router = useRouter();
  const updateVoucher = useUpdateVoucher();

  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies(1, 100, true);
  const { data: branchesResponse } = useBranches(1, 100, true);
  const branches = branchesResponse?.data;

  // Determinar form_voucher_type basado en voucher_type y with_return
  const getFormVoucherType = (voucherType: string, withReturn: boolean): 'ENTRY' | 'EXIT_WITH_RETURN' | 'EXIT_WITHOUT_RETURN' => {
    if (voucherType === 'ENTRY') return 'ENTRY';
    return withReturn ? 'EXIT_WITH_RETURN' : 'EXIT_WITHOUT_RETURN';
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<VoucherEditFormData>({
    resolver: zodResolver(voucherEditSchema),
    mode: 'onChange',
    defaultValues: {
      form_voucher_type: getFormVoucherType(voucher.voucher_type, voucher.with_return),
      company_id: voucher.company_id,
      origin_branch_id: voucher.origin_branch_id || undefined,
      destination_branch_id: voucher.destination_branch_id || undefined,
      outer_destination: voucher.outer_destination || '',
      is_intercompany: voucher.is_intercompany || false,
      estimated_return_date: voucher.estimated_return_date || '',
      notes: voucher.notes || '',
      internal_notes: voucher.internal_notes || '',
    },
  });

  const selectedFormType = watch('form_voucher_type');
  const selectedCompanyId = watch('company_id');
  const isIntercompany = watch('is_intercompany');

  const onSubmit = async (data: VoucherEditFormData) => {
    try {
      // FIX: Asegurar que estimated_return_date se envíe como YYYY-MM-DD sin zona horaria
      let normalizedReturnDate = data.estimated_return_date || undefined;
      if (normalizedReturnDate && normalizedReturnDate.includes('T')) {
        // Tiene componente de tiempo, extraer solo la fecha
        normalizedReturnDate = normalizedReturnDate.split('T')[0];
      }

      // Convertir form_voucher_type a voucher_type + with_return
      const updateData = {
        voucher_type: data.form_voucher_type === 'ENTRY' ? 'ENTRY' : 'EXIT',
        with_return: data.form_voucher_type === 'EXIT_WITH_RETURN',
        company_id: data.company_id,
        origin_branch_id: data.origin_branch_id || undefined,
        destination_branch_id: data.destination_branch_id || undefined,
        outer_destination: data.outer_destination || undefined,
        is_intercompany: data.is_intercompany,
        estimated_return_date: normalizedReturnDate,
        notes: data.notes || undefined,
        internal_notes: data.internal_notes || undefined,
      };

      await updateVoucher.mutateAsync({
        id: voucher.id,
        data: updateData,
      });

      // Navegar de vuelta al detalle del voucher
      router.push(`/my-vouchers/${voucher.id}`);
    } catch (error) {
      // Error handled by hook
      console.error('Error updating voucher:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Edita la información básica del vale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Vale */}
            <div className="space-y-2">
              <Label htmlFor="form_voucher_type">Tipo de Vale *</Label>
              <Select
                value={selectedFormType}
                onValueChange={(value) => setValue('form_voucher_type', value as any, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">Entrada</SelectItem>
                  <SelectItem value="EXIT_WITH_RETURN">Salida con retorno</SelectItem>
                  <SelectItem value="EXIT_WITHOUT_RETURN">Salida sin retorno</SelectItem>
                </SelectContent>
              </Select>
              {errors.form_voucher_type && (
                <p className="text-sm text-red-500">{errors.form_voucher_type.message}</p>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <Select
                value={selectedCompanyId?.toString()}
                onValueChange={(value) => setValue('company_id', parseInt(value), { shouldDirty: true })}
                disabled={loadingCompanies}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companiesResponse?.data?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_id && (
                <p className="text-sm text-red-500">{errors.company_id.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Origen y Destino */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicaciones</CardTitle>
          <CardDescription>
            Seleccione las sucursales de origen y destino
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sucursal Origen */}
            <div className="space-y-2">
              <Label htmlFor="origin_branch_id">Sucursal Origen (opcional)</Label>
              <Select
                value={watch('origin_branch_id')?.toString() || ''}
                onValueChange={(value) => setValue('origin_branch_id', parseInt(value), { shouldDirty: true })}
                disabled={!branches}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sucursal origen" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branch_name} ({branch.branch_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sucursal Destino */}
            <div className="space-y-2">
              <Label htmlFor="destination_branch_id">Sucursal Destino (opcional)</Label>
              <Select
                value={watch('destination_branch_id')?.toString() || ''}
                onValueChange={(value) => setValue('destination_branch_id', parseInt(value), { shouldDirty: true })}
                disabled={!branches}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sucursal destino" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branch_name} ({branch.branch_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destino Externo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="outer_destination">
                Destino Externo (opcional)
                <span className="text-sm text-muted-foreground ml-2">
                  {isIntercompany
                    ? 'Destino externo para transferencia intercompañías'
                    : 'Para destinos fuera de sucursales internas'
                  }
                </span>
              </Label>
              <Controller
                name="outer_destination"
                control={control}
                render={({ field }) => (
                  <Input
                    id="outer_destination"
                    type="text"
                    placeholder="Ej: Obra Av. Principal #123, Cliente ABC, etc."
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            {/* Checkbox Intercompañías */}
            <div className="flex items-center space-x-2 md:col-span-2">
              <Controller
                name="is_intercompany"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="is_intercompany"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                )}
              />
              <Label
                htmlFor="is_intercompany"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Transferencia entre empresas (intercompañías)
              </Label>
            </div>

            {/* Fecha de Retorno Estimada - Solo para EXIT_WITH_RETURN */}
            {selectedFormType === 'EXIT_WITH_RETURN' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="estimated_return_date">Fecha de Retorno Estimada *</Label>
                <Input
                  id="estimated_return_date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('estimated_return_date')}
                />
                {errors.estimated_return_date && (
                  <p className="text-sm text-red-500">{errors.estimated_return_date.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas y Observaciones</CardTitle>
          <CardDescription>
            Información adicional sobre el vale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (visibles para todos)</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  placeholder="Ej: Material para proyecto XYZ..."
                  rows={3}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internal_notes">Notas Internas (solo gerencia)</Label>
            <Controller
              name="internal_notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="internal_notes"
                  placeholder="Notas internas..."
                  rows={3}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/my-vouchers/${voucher.id}`)}
          disabled={updateVoucher.isPending}
          className="bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={updateVoucher.isPending || !isDirty}
          className="bg-blue-600 text-white hover:bg-blue-800 transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-700"
        >
          {updateVoucher.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando cambios...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}
