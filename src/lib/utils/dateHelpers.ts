import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha ISO a formato legible en español con hora
 *
 * @param isoDate - Fecha en formato ISO (ej: "2025-12-02T10:30:00")
 * @returns Fecha formateada (ej: "2 de dic. de 2025, 10:30")
 *
 * @example
 * formatLogDate("2025-12-02T10:30:00")
 * // Returns: "2 de dic. de 2025, 10:30"
 */
export const formatLogDate = (isoDate: string): string => {
  try {
    const date = parseISO(isoDate);
    return format(date, "d 'de' MMM 'de' yyyy, HH:mm", { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return isoDate; // Fallback: retornar fecha original si hay error
  }
};

/**
 * Formatea una fecha ISO a formato corto sin hora
 *
 * @param isoDate - Fecha en formato ISO (ej: "2025-12-02T10:30:00")
 * @returns Fecha formateada (ej: "02/12/2025")
 *
 * @example
 * formatShortDate("2025-12-02T10:30:00")
 * // Returns: "02/12/2025"
 */
export const formatShortDate = (isoDate: string): string => {
  try {
    const date = parseISO(isoDate);
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return isoDate; // Fallback: retornar fecha original si hay error
  }
};
