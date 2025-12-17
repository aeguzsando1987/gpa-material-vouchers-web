'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, FileText, Calendar } from 'lucide-react';
import { voucherService } from '@/lib/api/services/voucherService';
import { Voucher } from '@/lib/types/voucher';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VoucherSearchCardProps {
  onSelectVoucher: (voucherId: number) => void;
  isLoading?: boolean;
  refreshTrigger?: number; // Incrementar este valor para forzar refresh
}

export default function VoucherSearchCard({
  onSelectVoucher,
  isLoading = false,
  refreshTrigger = 0,
}: VoucherSearchCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [approvedVouchers, setApprovedVouchers] = useState<Voucher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Cargar vales APROBADOS recientes al montar y cuando cambie refreshTrigger
  useEffect(() => {
    loadApprovedVouchers();
  }, [refreshTrigger]);

  // Cargar vales aprobados de tipo EXIT usando búsqueda avanzada
  const loadApprovedVouchers = async () => {
    setIsLoadingList(true);
    try {
      const vouchers = await voucherService.search({
        status: 'APPROVED',
        voucher_type: 'EXIT',
        limit: 10,
      });
      setApprovedVouchers(vouchers);
    } catch (error: any) {
      console.error('Error loading approved vouchers:', error);
      toast.error('Error al cargar vales aprobados');
    } finally {
      setIsLoadingList(false);
    }
  };

  // Buscar por folio o ID con coincidencias parciales
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Ingresa un folio o ID para buscar');
      return;
    }

    setIsSearching(true);
    try {
      const searchValue = searchTerm.trim();

      // Buscar con coincidencias parciales usando search/advanced
      const vouchers = await voucherService.search({
        search_term: searchValue, // Busca en folio y notas
        status: 'APPROVED',
        voucher_type: 'EXIT',
        limit: 10,
      });

      if (vouchers.length === 0) {
        toast.error('No se encontraron vales que coincidan con la búsqueda', {
          description: 'Asegúrate de que el vale esté APROBADO y sea de tipo SALIDA',
        });
        setIsSearching(false);
        return;
      }

      // Si solo hay un resultado, seleccionarlo automáticamente
      if (vouchers.length === 1) {
        onSelectVoucher(vouchers[0].id);
        setSearchTerm('');
      } else {
        // Si hay múltiples resultados, actualizar la lista
        setApprovedVouchers(vouchers);
        toast.success(`Se encontraron ${vouchers.length} vales`);
        setSearchTerm('');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al buscar vale';
      toast.error('Error en búsqueda', {
        description: errorMsg,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Vale
        </CardTitle>
        <CardDescription>
          Busca por folio (ej: ACM-SAL-2025-0001), ID (ej: 27) o texto parcial, o selecciona uno de la lista
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de búsqueda */}
        <div className="space-y-2">
          <Label htmlFor="search-folio">Folio, ID o Texto Parcial</Label>
          <div className="flex gap-2">
            <Input
              id="search-folio"
              type="text"
              placeholder="Ej: ACM-SAL-2025-0001 o 27 o ACM"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching || isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || isLoading || !searchTerm.trim()}
              className="cursor-pointer"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Buscar</span>
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O selecciona uno reciente
            </span>
          </div>
        </div>

        {/* Lista de vales APROBADOS recientes */}
        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : approvedVouchers.length > 0 ? (
          <div className="space-y-2">
            <Label>Vales Aprobados Recientes ({approvedVouchers.length})</Label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {approvedVouchers.map((voucher) => (
                <Button
                  key={voucher.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 cursor-pointer hover:bg-accent"
                  onClick={() => onSelectVoucher(voucher.id)}
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-3 w-full">
                    <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div className="flex-1 text-left space-y-1">
                      <div className="font-semibold">{voucher.folio}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(voucher.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-300">
                          {voucher.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {voucher.voucher_type}
                        </Badge>
                        {voucher.with_return && (
                          <Badge variant="secondary" className="text-xs">
                            Con Retorno
                          </Badge>
                        )}
                        {voucher.is_intercompany && (
                          <Badge variant="secondary" className="text-xs">
                            Intercompañía
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay vales aprobados pendientes de validación</p>
            <p className="text-sm mt-1">
              Los vales en estado APPROVED aparecerán aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
