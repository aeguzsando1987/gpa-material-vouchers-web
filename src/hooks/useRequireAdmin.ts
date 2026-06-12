'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Guard de página solo-admin.
 *
 * Redirige al dashboard a cualquier usuario que NO sea Admin (role !== 1)
 * que intente acceder por URL directa a una página restringida.
 *
 * Retorna `true` cuando el usuario es Admin (la página puede renderizarse).
 * Mientras se hidrata el estado o si no es admin, retorna `false` para que
 * la página no muestre contenido restringido.
 */
export function useRequireAdmin(): boolean {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const isAdmin = user?.role === 1;

  useEffect(() => {
    if (hasHydrated && user && !isAdmin) {
      router.replace('/');
    }
  }, [hasHydrated, user, isAdmin, router]);

  return isAdmin;
}
