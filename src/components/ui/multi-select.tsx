'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Option {
  value: number;
  label: string;
}

interface MultiSelectProps {
  value: number[];
  onChange: (values: number[]) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'w-full justify-between min-h-10 h-auto py-2 font-normal',
          open && 'border-ring ring-1 ring-ring',
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 text-left">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={0}
                  className="ml-1 rounded-full hover:bg-muted-foreground/30 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleRemove(opt.value, e);
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 opacity-50 flex-shrink-0 ml-2 transition-transform', open && 'rotate-180')}
        />
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {options.length === 0 ? (
            <div className="py-3 text-center text-sm text-muted-foreground">
              No hay opciones disponibles
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleToggle(option.value)}
                  >
                    {/* Indicador visual propio (sin Radix Checkbox para evitar el bucle de
                        compose-refs bajo React 19) */}
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
