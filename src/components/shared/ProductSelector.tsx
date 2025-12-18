'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Package, TrendingUp, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProductSearch, useTopProducts } from '@/hooks/useProducts';
import { ProductSearchResult } from '@/lib/types/product';

interface ProductSelectorProps {
  onSelect: (product: ProductSearchResult) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ProductSelector({
  onSelect,
  label = 'Buscar Producto',
  placeholder = 'Busca por código o nombre...',
  className = '',
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showTopProducts, setShowTopProducts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search query (se activa solo si hay búsqueda)
  const { data: searchResults, isLoading: isSearching } = useProductSearch(
    debouncedSearch,
    10,
    debouncedSearch.length >= 2
  );

  // Top products query (se activa al hacer focus si no hay búsqueda)
  const { data: topProducts, isLoading: isLoadingTop } = useTopProducts(10);

  // Determinar qué resultados mostrar
  const resultsToShow = debouncedSearch.length >= 2 ? searchResults : topProducts;
  const isLoading = debouncedSearch.length >= 2 ? isSearching : isLoadingTop;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setShowTopProducts(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(true);
    setShowTopProducts(false);
  };

  const handleInputFocus = () => {
    if (!searchTerm) {
      setShowTopProducts(true);
      setShowResults(false);
    } else {
      setShowResults(true);
      setShowTopProducts(false);
    }
  };

  const handleProductSelect = (product: ProductSearchResult) => {
    onSelect(product);
    setSearchTerm('');
    setShowResults(false);
    setShowTopProducts(false);
    inputRef.current?.blur();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setShowResults(false);
    setShowTopProducts(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="product-search" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          {label}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id="product-search"
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {(showResults || showTopProducts) && (
        <Card
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-lg"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {showTopProducts ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>Productos más usados</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>
                    {isLoading ? 'Buscando...' : `${resultsToShow?.length || 0} resultados`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Results list */}
          {!isLoading && resultsToShow && resultsToShow.length > 0 && (
            <div className="py-2">
              {resultsToShow.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="w-full px-4 py-3 bg-background hover:bg-accent transition-colors flex items-start gap-3 text-left border-b border-border last:border-0"
                  onClick={() => handleProductSelect(product)}
                >
                  <Package className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {product.code && (
                        <Badge variant="outline" className="text-xs">
                          {product.code}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {product.unit_of_measure}
                      </Badge>
                      {showTopProducts && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {product.usage_count} usos
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!resultsToShow || resultsToShow.length === 0) && (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {showTopProducts
                  ? 'No hay productos en el catálogo'
                  : 'No se encontraron productos'}
              </p>
              {showResults && searchTerm && (
                <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
