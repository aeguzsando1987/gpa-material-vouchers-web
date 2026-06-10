'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { canCheckExits } from '@/lib/types/auth';
import { useConfirmEntry } from '@/hooks/useConfirmEntry';
import { voucherService } from '@/lib/api/services/voucherService';
import { individualService } from '@/lib/api/services/individualService';
import { toast } from 'sonner';
import { Loader2, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoucherWithDetails } from '@/lib/types/voucher';

import VoucherSearchCard from './components/VoucherSearchCard';
import VoucherDetailsCard from '@/components/vouchers/VoucherDetailsCard';
import ConfirmEntryDialog, {
  ConfirmEntryFormData,
} from './components/ConfirmEntryDialog';

export default function ConfirmEntryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherWithDetails | null>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentUserIndividualId, setCurrentUserIndividualId] = useState<number | null>(null);

  const confirmMutation = useConfirmEntry();

  // Guard de rol: solo Admin y Vigilante pueden acceder a esta pantalla.
  // Bloquea el acceso por URL directa (el menú ya oculta el link).
  useEffect(() => {
    if (user && !canCheckExits(user.role)) {
      toast.error('No tienes permiso para acceder a Confirmar Entradas');
      router.replace('/my-vouchers');
    }
  }, [user, router]);

  // Obtener Individual ID del usuario actual
  useEffect(() => {
    const fetchIndividual = async () => {
      if (!user) return;

      try {
        // Buscar individual por user_id usando el helper
        const userIndividual = await individualService.getByUserId(user.id);

        if (userIndividual) {
          setCurrentUserIndividualId(userIndividual.id);
        } else {
          toast.error('Error: No se encontró el perfil del usuario', {
            description: 'Contacta al administrador para asociar tu cuenta con un perfil'
          });
        }
      } catch (error: any) {
        console.error('Error fetching individual:', error);
        toast.error('Error al obtener perfil de usuario');
      }
    };

    fetchIndividual();
  }, [user]);

  // Cargar voucher seleccionado
  const handleSelectVoucher = async (voucherId: number) => {
    setSelectedVoucherId(voucherId);
    setIsLoadingVoucher(true);

    try {
      const voucher = await voucherService.getById(voucherId, { include_details: true });
      setSelectedVoucher(voucher);
    } catch (error: any) {
      console.error('Error loading voucher:', error);
      toast.error('Error al cargar el vale', {
        description: error.response?.data?.detail || 'Intenta de nuevo'
      });
      setSelectedVoucher(null);
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  // Abrir dialog de confirmación
  const handleOpenConfirmDialog = () => {
    if (!currentUserIndividualId) {
      toast.error('No se puede confirmar', {
        description: 'No se encontró tu perfil de usuario'
      });
      return;
    }

    if (!selectedVoucher) {
      toast.error('No hay vale seleccionado');
      return;
    }

    setShowConfirmDialog(true);
  };

  // Confirmar entrada
  const handleConfirm = async (data: ConfirmEntryFormData) => {
    if (!selectedVoucherId || !currentUserIndividualId) {
      toast.error('Datos incompletos');
      return;
    }

    confirmMutation.mutate(
      {
        voucherId: selectedVoucherId,
        data: {
          received_by_id: currentUserIndividualId,
          line_validations: data.line_validations,
          general_observations: data.general_observations,
        },
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          // Limpiar selección
          setSelectedVoucher(null);
          setSelectedVoucherId(null);
        },
      }
    );
  };

  // No renderizar el contenido si el rol no está autorizado (se está redirigiendo)
  if (user && !canCheckExits(user.role)) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PackageCheck className="h-8 w-8 text-green-600" />
            Confirmar Entradas de Material
          </h1>
          <p className="text-muted-foreground mt-1">
            Valida y confirma la recepción de material
          </p>
        </div>
      </div>

      {/* Alerta informativa */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <AlertDescription>
          <p className="text-sm">
            <strong>Modo estricto:</strong> El vale SOLO cerrará si TODAS las líneas tienen validación OK.
            Si hay problemas, el vale se marcará como INCOMPLETE_DAMAGED.
          </p>
        </AlertDescription>
      </Alert>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Búsqueda */}
        <VoucherSearchCard onSelectVoucher={handleSelectVoucher} />

        {/* Columna derecha: Detalles + Botón */}
        <div className="space-y-4">
          {isLoadingVoucher ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : selectedVoucher ? (
            <>
              <VoucherDetailsCard voucher={selectedVoucher} />

              {/* Botón de confirmación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleOpenConfirmDialog}
                    disabled={!currentUserIndividualId}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <PackageCheck className="mr-2 h-5 w-5" />
                    Confirmar Entrada de Material
                  </Button>
                  {!currentUserIndividualId && (
                    <p className="text-sm text-red-500 mt-2">
                      No se puede confirmar sin perfil de usuario asociado
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <PackageCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Selecciona un vale de la izquierda para ver sus detalles
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de confirmación */}
      {selectedVoucher && (
        <ConfirmEntryDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          voucher={selectedVoucher}
          onConfirm={handleConfirm}
          isPending={confirmMutation.isPending}
        />
      )}
    </div>
  );
}
