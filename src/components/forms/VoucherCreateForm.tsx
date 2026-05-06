'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { useCreateVoucher } from '@/hooks/useVouchers';
import { useCompanies } from '@/hooks/useCompanies';
import { useBranches } from '@/hooks/useBranches';
import { useAuthStore } from '@/lib/store/authStore';
import { voucherDetailService } from '@/lib/api/services/voucherDetailService';
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
import VoucherDetailsEditor, { VoucherDetailDraft } from '@/components/vouchers/VoucherDetailsEditor';
import { VoucherSuccessModal } from '@/components/vouchers/VoucherSuccessModal';

const voucherCreateSchema = z.object({
  form_voucher_type: z.enum(['ENTRY', 'EXIT_WITH_RETURN', 'EXIT_WITHOUT_RETURN'] as const),
  company_id: z.number().min(1, 'Empresa requerida'),
  origin_branch_id: z.number().optional(),
  destination_branch_id: z.number().optional(),
  outer_destination: z.string().optional(), // NUEVO
  delivered_by_id: z.number().min(1, 'Responsable requerido'),
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
  // Si estimated_return_date existe, no puede ser anterior a hoy
  if (data.estimated_return_date) {
    // Comparar strings de fecha en formato YYYY-MM-DD para evitar problemas de timezone
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    if (data.estimated_return_date < todayString) {
      return false;
    }
  }
  return true;
}, {
  message: 'La fecha de retorno no puede ser anterior a hoy',
  path: ['estimated_return_date'],
});

type VoucherCreateFormData = z.infer<typeof voucherCreateSchema>;

export default function VoucherCreateForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createVoucher = useCreateVoucher();
  const [details, setDetails] = useState<VoucherDetailDraft[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    voucherId: 0,
    voucherFolio: '',
  });

  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies(1, 100, true);

  // Filtrar empresas según el rol del usuario:
  // - Admin (role=1): ve todas las empresas
  // - Otros roles: solo ven sus empresas asignadas (company_id + allowed_company_ids)
  const allCompanies = companiesResponse?.data || [];
  const filteredCompanies = user?.role === 1
    ? allCompanies
    : allCompanies.filter((company) => {
        const accessibleIds = [
          ...(user?.company_id ? [user.company_id] : []),
          ...(user?.allowed_company_ids || []),
        ];
        return accessibleIds.includes(company.id);
      });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<VoucherCreateFormData>({
    resolver: zodResolver(voucherCreateSchema),
    mode: 'onChange', // Mantener estado de campos en cada cambio
    shouldUnregister: false, // No desregistrar campos al desmontar
    defaultValues: {
      form_voucher_type: 'EXIT_WITHOUT_RETURN',
      is_intercompany: false,
      delivered_by_id: user?.individual_id || 1, // ID del individual del usuario actual
    },
  });

  const selectedFormType = watch('form_voucher_type');
  const selectedCompanyId = watch('company_id');
  const isIntercompany = watch('is_intercompany');

  // Obtener TODAS las sucursales (sin filtrar por empresa)
  const { data: branchesResponse } = useBranches(1, 100, true);
  const branches = branchesResponse?.data;

  // Actualizar delivered_by_id cuando el usuario se carga
  useEffect(() => {
    if (user?.individual_id) {
      setValue('delivered_by_id', user.individual_id);
    }
  }, [user?.individual_id, setValue]);

  // Memoizar handler de details para prevenir re-renders innecesarios (Bug 4)
  const handleDetailsChange = useCallback((newDetails: VoucherDetailDraft[]) => {
    setDetails(newDetails);
  }, []);

  const onSubmit = async (data: VoucherCreateFormData) => {
    try {
      setIsCreating(true);

      // Convertir form_voucher_type a voucher_type + with_return
      const apiData = {
        ...data,
        voucher_type: data.form_voucher_type === 'ENTRY' ? 'ENTRY' : 'EXIT',
        with_return: data.form_voucher_type === 'EXIT_WITH_RETURN',
      } as any;

      // Remover el campo temporal
      delete apiData.form_voucher_type;

      // Limpiar estimated_return_date: eliminar si está vacío (vale sin retorno)
      // Un string vacío "" del <input type="date"> causa error 422 en el backend
      if (!apiData.estimated_return_date) {
        delete apiData.estimated_return_date;
      } else {
        // Normalizar a YYYY-MM-DD sin zona horaria
        const dateStr = apiData.estimated_return_date as string;
        apiData.estimated_return_date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }

      // 1. Crear el voucher
      const createdVoucher = await createVoucher.mutateAsync(apiData);

      // 2. Crear las líneas de detalle si hay alguna
      if (details.length > 0) {
        for (let i = 0; i < details.length; i++) {
          const detail = details[i];
          try {
            await voucherDetailService.create({
              voucher_id: createdVoucher.id,
              line_number: detail.line_number,
              product_id: detail.product_id,
              item_name: detail.item_name,
              item_description: detail.item_description,
              quantity: detail.quantity,
              unit_of_measure: detail.unit_of_measure,
              serial_number: detail.serial_number,
              part_number: detail.part_number,
              category: detail.category,
              notes: detail.notes,
            });

            // Pequeño delay para evitar problemas de timing
            if (i < details.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            // Continuar con las siguientes líneas incluso si una falla
          }
        }
      }

      // 3. Mostrar modal de éxito
      setSuccessModal({
        isOpen: true,
        voucherId: createdVoucher.id,
        voucherFolio: createdVoucher.folio,
      });

      // Limpiar detalles después de crear
      setDetails([]);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Complete la información básica del vale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Vale */}
            <div className="space-y-2">
              <Label htmlFor="form_voucher_type">Tipo de Vale *</Label>
              <Select
                value={selectedFormType}
                onValueChange={(value) => setValue('form_voucher_type', value as any)}
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
                onValueChange={(value) => setValue('company_id', parseInt(value))}
                disabled={loadingCompanies}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona empresa" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompanies.map((company) => (
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
                value={watch('origin_branch_id')?.toString()}
                onValueChange={(value) => setValue('origin_branch_id', parseInt(value))}
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
              {errors.origin_branch_id && (
                <p className="text-sm text-red-500">{errors.origin_branch_id.message}</p>
              )}
            </div>

            {/* Sucursal Destino */}
            <div className="space-y-2">
              <Label htmlFor="destination_branch_id">Sucursal Destino (opcional)</Label>
              <Select
                value={watch('destination_branch_id')?.toString()}
                onValueChange={(value) => setValue('destination_branch_id', parseInt(value))}
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
              {errors.destination_branch_id && (
                <p className="text-sm text-red-500">{errors.destination_branch_id.message}</p>
              )}
            </div>

            {/* Destino Externo - SIEMPRE visible */}
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
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.outer_destination && (
                <p className="text-sm text-red-500">{errors.outer_destination.message}</p>
              )}
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
                <Label htmlFor="estimated_return_date">
                  Fecha de Retorno Estimada *
                </Label>
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
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
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
            {errors.internal_notes && (
              <p className="text-sm text-red-500">{errors.internal_notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor de Líneas de Detalle */}
      <VoucherDetailsEditor details={details} onChange={handleDetailsChange} />

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/my-vouchers')}
          disabled={isCreating}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando vale y líneas...
            </>
          ) : (
            'Crear Vale'
          )}
        </Button>
      </div>

      {/* Modal de éxito */}
      <VoucherSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        voucherId={successModal.voucherId}
        voucherFolio={successModal.voucherFolio}
      />
    </form>
  );
}
