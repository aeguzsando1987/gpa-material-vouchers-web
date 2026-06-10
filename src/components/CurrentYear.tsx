'use client';

/**
 * Renderiza el año actual del cliente. Como /login se prerenderiza de forma
 * estática, usar `new Date().getFullYear()` directo en el server lo congelaría
 * al año del build. Este client component lo evalúa en el navegador para que
 * siempre muestre el año en curso. `suppressHydrationWarning` evita el aviso
 * de mismatch en el cambio de año entre build y render.
 */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
