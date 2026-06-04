'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProductSearch, useTopProducts } from '@/hooks/useProducts';
import { Product, ProductSearchResult } from '@/lib/types/product';

interface ProductAutocompleteCellProps {
  /** Valor actual del nombre del artículo (item_name). */
  value: string;
  /** Se dispara cuando el usuario escribe manualmente (entrada libre). */
  onChange: (value: string) => void;
  /** Se dispara al elegir un producto del catálogo (autollenado de la fila). */
  onSelectProduct: (product: ProductSearchResult) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Celda de tabla con autocompletado de productos.
 *
 * Reutiliza los mismos hooks que ProductSelector (useProductSearch / useTopProducts):
 * al escribir 2+ caracteres muestra coincidencias del catálogo en un desplegable
 * debajo de la celda; si el usuario no elige ninguna, la entrada queda como manual.
 * Sin dependencias nuevas: el desplegable es un div posicionado en absoluto.
 */
export default function ProductAutocompleteCell({
  value,
  onChange,
  onSelectProduct,
  disabled = false,
  placeholder = 'Nombre del artículo...',
}: ProductAutocompleteCellProps) {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce del término que dispara la búsqueda (igual que ProductSelector: 300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: searchResults, isLoading: isSearching } = useProductSearch(
    debouncedSearch,
    10,
    debouncedSearch.length >= 2
  );
  const { data: topProducts, isLoading: isLoadingTop } = useTopProducts(10);

  const showingSearch = debouncedSearch.length >= 2;
  // Normalizamos topProducts (Product[]) al shape de búsqueda para un único render/select.
  const topAsResults: ProductSearchResult[] = (topProducts ?? []).map((p: Product) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    part_number: p.part_number,
    description: p.description,
    category: p.category,
    unit_of_measure: p.unit_of_measure,
    usage_count: p.usage_count,
  }));
  const results = showingSearch ? searchResults ?? [] : topAsResults;
  const isLoading = showingSearch ? isSearching : isLoadingTop;

  // Cerrar el desplegable al hacer click fuera de la celda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: ProductSearchResult) => {
    onSelectProduct(product);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="min-w-[180px] h-9"
        autoComplete="off"
      />

      {open && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 top-full mt-1 w-[280px] max-h-64 overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg"
        >
          <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-muted-foreground">
            {showingSearch ? (
              <>
                <Package className="h-3.5 w-3.5" />
                <span>{isLoading ? 'Buscando...' : `${results.length} coincidencias`}</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Productos más usados</span>
              </>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-1">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2 text-left transition-colors last:border-0 hover:bg-blue-50"
                >
                  <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{product.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {product.code && (
                        <Badge variant="outline" className="text-[10px]">
                          {product.code}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {product.unit_of_measure}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-gray-500">
              {showingSearch
                ? 'Sin coincidencias. Se guardará como entrada manual.'
                : 'No hay productos en el catálogo.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
