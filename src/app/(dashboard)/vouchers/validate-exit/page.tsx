'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useValidateExit } from '@/hooks/useValidateExit';
import { voucherService } from '@/lib/api/services/voucherService';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoucherWithDetails } from '@/lib/types/voucher';

import VoucherSearchCard from './components/VoucherSearchCard';
import VoucherDetailsCard from '@/components/vouchers/VoucherDetailsCard';
import ValidateExitDialog, {
  ValidateExitFormData,
} from './components/ValidateExitDialog';

export default function ValidateExitPage() {
  const { user } = useAuthStore();
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherWithDetails | null>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const validateMutation = useValidateExit();

  // Obtener Individual ID del usuario actual
  const currentUserIndividualId = user?.individual_id;

  // Validar que el usuario tenga individual_id
  useEffect(() => {
    if (user && !user.individual_id) {
      toast.error('No se encontró un registro de individual asociado a tu usuario', {
        description: 'Contacta al administrador para resolver este problema',
      });
    }
  }, [user]);

  // Cargar voucher seleccionado
  const handleSelectVoucher = async (voucherId: number) => {
    setIsLoadingVoucher(true);
    try {
      const voucher = await voucherService.getById(voucherId, {
        detailed: true,
        include_details: true,
      });

      // Validaciones
      if (voucher.status !== 'APPROVED') {
        toast.error('El vale debe estar en estado APROBADO para validar salida', {
          description: `Estado actual: ${voucher.status}`,
        });
        setIsLoadingVoucher(false);
        return;
      }

      if (voucher.voucher_type !== 'EXIT') {
        toast.error('Solo se pueden validar vales de SALIDA (EXIT)', {
          description: `Tipo de vale: ${voucher.voucher_type}`,
        });
        setIsLoadingVoucher(false);
        return;
      }

      // Validar que el voucher tenga detalles
      if (!voucher.details || voucher.details.length === 0) {
        toast.error('El vale no tiene líneas de detalle para validar');
        setIsLoadingVoucher(false);
        return;
      }

      setSelectedVoucher(voucher);
      setSelectedVoucherId(voucherId);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al cargar el vale';
      toast.error(errorMsg);
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  // Manejar confirmación de validación
  const handleValidateConfirm = async (data: ValidateExitFormData) => {
    if (!selectedVoucherId || !currentUserIndividualId) {
      toast.error('Información incompleta para validar salida');
      return;
    }

    validateMutation.mutate(
      {
        voucher_id: selectedVoucherId,
        scanned_by_id: currentUserIndividualId,
        line_validations: data.line_validations,
        general_observations: data.general_observations,
      },
      {
        onSuccess: () => {
          setShowValidateDialog(false);
          setSelectedVoucher(null);
          setSelectedVoucherId(null);
          // Refrescar lista de vales aprobados
          setRefreshTrigger((prev) => prev + 1);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          Check de Salida
        </h1>
        <p className="text-muted-foreground mt-1">
          Valida visualmente los artículos y autoriza su salida
        </p>
      </div>

      {/* Debug Card - TEMPORAL */}
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm text-yellow-800">
            🔍 Debug - Información del Usuario (TEMPORAL)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="font-mono text-xs">
            <div><strong>Email:</strong> {user?.email || 'No cargado'}</div>
            <div><strong>Nombre:</strong> {user?.name || 'No cargado'}</div>
            <div><strong>Role:</strong> {user?.role || 'No cargado'}</div>
            <div><strong>Individual ID:</strong> {user?.individual_id ? user.individual_id : <span className="text-red-600 font-bold">❌ NULL/UNDEFINED</span>}</div>
            <div className="mt-2"><strong>Usuario completo:</strong></div>
            <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {!currentUserIndividualId && (
            <Alert className="bg-red-50 border-red-300">
              <AlertDescription className="text-red-800 text-sm">
                <strong>⚠️ PROBLEMA DETECTADO:</strong> El usuario NO tiene <code>individual_id</code> asignado.
                Esto es necesario para validar salidas. Contacta al administrador para:
                <ol className="list-decimal ml-5 mt-2">
                  <li>Crear un registro de Individual para este usuario</li>
                  <li>Asignar el <code>individual_id</code> en la tabla de usuarios</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Búsqueda de voucher */}
      <VoucherSearchCard
        onSelectVoucher={handleSelectVoucher}
        isLoading={isLoadingVoucher}
        refreshTrigger={refreshTrigger}
      />

      {/* Loading state */}
      {isLoadingVoucher && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando vale...</span>
        </div>
      )}

      {/* Detalles del vale seleccionado */}
      {selectedVoucher && !isLoadingVoucher && (
        <>
          <VoucherDetailsCard voucher={selectedVoucher} />

          {/* Botón para abrir dialog de validación */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => setShowValidateDialog(true)}
              disabled={!currentUserIndividualId}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Validar Salida
            </Button>
          </div>
        </>
      )}

      {/* Dialog de validación */}
      {selectedVoucher && (
        <ValidateExitDialog
          open={showValidateDialog && !!currentUserIndividualId}
          onOpenChange={setShowValidateDialog}
          voucher={selectedVoucher}
          onConfirm={handleValidateConfirm}
          isPending={validateMutation.isPending}
        />
      )}
    </div>
  );
}
