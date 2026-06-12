'use client';

import { useRequireAdmin } from '@/hooks/useRequireAdmin';

/**
 * Guard solo-admin para todo el subárbol /misc
 * (Compañías, Sucursales, Productos y sus páginas de crear/editar).
 *
 * Oculta el contenido y redirige al dashboard a cualquier usuario que no sea
 * Admin (role !== 1) que intente acceder por URL directa. El sidebar ya oculta
 * estos enlaces para no-admin; esto cierra el acceso por URL.
 */
export default function MiscLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = useRequireAdmin();

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
