'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  PackageOpen,
  Building2,
  PackagePlus,
  Clock,
  Loader2,
  FileText,
} from 'lucide-react';
import { voucherService } from '@/lib/api/services/voucherService';
import { VoucherWithDetails } from '@/lib/types/voucher';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils/dateHelpers';

type VoucherCategory = 'return' | 'intercompany' | 'entry' | 'overdue';

interface VoucherSearchCardProps {
  onSelectVoucher: (voucherId: number) => void;
}

const tabs = [
  {
    id: 'return' as VoucherCategory,
    label: 'Con Retorno',
    icon: PackageOpen,
    description: 'Vales EXIT con retorno en tránsito',
  },
  {
    id: 'intercompany' as VoucherCategory,
    label: 'Intercompañía',
    icon: Building2,
    description: 'Translados entre sucursales',
  },
  {
    id: 'entry' as VoucherCategory,
    label: 'Solo Entrada',
    icon: PackagePlus,
    description: 'Vales ENTRY pendientes de recepción',
  },
  {
    id: 'overdue' as VoucherCategory,
    label: 'Vencidos',
    icon: Clock,
    description: 'Vales con fecha de retorno vencida',
  },
];

export default function VoucherSearchCard({ onSelectVoucher }: VoucherSearchCardProps) {
  const [activeTab, setActiveTab] = useState<VoucherCategory>('return');
  const [searchValue, setSearchValue] = useState('');
  const [vouchersList, setVouchersList] = useState<VoucherWithDetails[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<VoucherCategory, number>>({
    return: 0,
    intercompany: 0,
    entry: 0,
    overdue: 0,
  });

  // Cargar vales al cambiar de tab
  useEffect(() => {
    loadVouchersByCategory(activeTab);
  }, [activeTab]);

  // Cargar vales por categoría
  const loadVouchersByCategory = async (category: VoucherCategory) => {
    setIsLoadingList(true);
    try {
      let params: any = { limit: 20 };

      switch (category) {
        case 'return':
          // EXIT con retorno en tránsito
          params = {
            voucher_type: 'EXIT',
            status: 'IN_TRANSIT',
            // with_return: true, // TODO: Verificar si el backend soporta este filtro
            ...params,
          };
          break;

        case 'intercompany':
          // EXIT intercompañía en tránsito
          params = {
            voucher_type: 'EXIT',
            status: 'IN_TRANSIT',
            // is_intercompany: true, // TODO: Verificar si el backend soporta este filtro
            ...params,
          };
          break;

        case 'entry':
          // ENTRY pendientes
          params = {
            voucher_type: 'ENTRY',
            status: 'PENDING',
            ...params,
          };
          break;

        case 'overdue':
          // Vales vencidos
          params = {
            status: 'OVERDUE',
            ...params,
          };
          break;
      }

      const vouchers = await voucherService.search(params);
      setVouchersList(vouchers);

      // Actualizar contador de la categoría actual
      setCategoryCounts(prev => ({
        ...prev,
        [category]: vouchers.length
      }));
    } catch (error: any) {
      console.error('Error loading vouchers by category:', error);
      toast.error('Error al cargar vales', {
        description: error.response?.data?.detail || 'Intenta de nuevo'
      });
      setVouchersList([]);
      setCategoryCounts(prev => ({
        ...prev,
        [category]: 0
      }));
    } finally {
      setIsLoadingList(false);
    }
  };

  // Búsqueda manual por folio
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Ingresa un folio para buscar');
      return;
    }

    setIsSearching(true);
    try {
      const vouchers = await voucherService.search({
        search_term: searchValue,
        // Filtrar solo vales válidos para entrada
        limit: 10,
      });

      if (vouchers.length === 0) {
        toast.error('No se encontraron vales', {
          description: `No hay vales con el folio "${searchValue}"`
        });
        return;
      }

      // Si solo hay un resultado, seleccionarlo automáticamente
      if (vouchers.length === 1) {
        onSelectVoucher(vouchers[0].id);
        toast.success('Vale encontrado', {
          description: `Folio: ${vouchers[0].folio}`
        });
      } else {
        // Mostrar lista de resultados
        setVouchersList(vouchers);
        toast.success(`${vouchers.length} vales encontrados`);
      }
    } catch (error: any) {
      console.error('Error searching vouchers:', error);
      toast.error('Error en la búsqueda', {
        description: error.response?.data?.detail || 'Intenta de nuevo'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar tecla Enter en búsqueda
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Vales para Confirmar Entrada
        </CardTitle>
        <CardDescription>
          Selecciona una categoría o busca por folio
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda manual */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por folio..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchValue.trim()}
            className="shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Tabs por categoría */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VoucherCategory)}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = categoryCounts[tab.id];
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{tab.description}</p>

                {/* Lista de vales */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {isLoadingList ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : vouchersList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay vales en esta categoría</p>
                    </div>
                  ) : (
                    vouchersList.map((voucher) => (
                      <div
                        key={voucher.id}
                        onClick={() => onSelectVoucher(voucher.id)}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-sm">{voucher.folio}</p>
                            <p className="text-xs text-muted-foreground">
                              {voucher.company_name}
                            </p>
                            {voucher.estimated_return_date && (
                              <p className="text-xs text-muted-foreground">
                                Retorno estimado: {format(parseLocalDate(voucher.estimated_return_date), 'dd/MM/yyyy')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-xs">
                              {voucher.status}
                            </Badge>
                            {voucher.is_intercompany && (
                              <Badge variant="secondary" className="text-xs">
                                Intercompañía
                              </Badge>
                            )}
                            {voucher.with_return && (
                              <Badge variant="default" className="text-xs">
                                Con Retorno
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
