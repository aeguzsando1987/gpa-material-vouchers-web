/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Formatea una fecha en formato YYYY-MM-DD a string localizado sin conversión de zona horaria
 *
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2026-01-15")
 * @param locale - Locale para formatear (default: 'es-MX')
 * @param options - Opciones de formato de Intl.DateTimeFormat
 * @returns Fecha formateada como string
 *
 * @example
 * formatDateWithoutTimezone("2026-01-15") // "15 de enero de 2026"
 * formatDateWithoutTimezone("2026-01-15", 'es-MX', { dateStyle: 'short' }) // "15/01/2026"
 */
export function formatDateWithoutTimezone(
  dateString: string,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  if (!dateString) return '';

  // Parsear la fecha como componentes locales (año, mes, día)
  // Esto evita la conversión de zona horaria que ocurre con new Date("YYYY-MM-DD")
  const [year, month, day] = dateString.split('-').map(Number);

  // Crear Date con componentes locales (mes es 0-indexed)
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString(locale, options);
}

/**
 * Formatea una fecha ISO 8601 completa (con tiempo) a string localizado
 *
 * @param isoString - Fecha en formato ISO 8601 (ej: "2026-01-15T19:30:00.000Z")
 * @param locale - Locale para formatear (default: 'es-MX')
 * @param options - Opciones de formato de Intl.DateTimeFormat
 * @returns Fecha y hora formateadas como string
 *
 * @example
 * formatDateTime("2026-01-15T19:30:00.000Z") // "15 de enero de 2026, 13:30:00"
 */
export function formatDateTime(
  isoString: string,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  return date.toLocaleDateString(locale, options);
}

/**
 * Convierte una fecha YYYY-MM-DD a objeto Date local (sin conversión UTC)
 *
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date con hora local en medianoche
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
