'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layouts/DashboardSidebar';
import DashboardHeader from '@/components/layouts/DashboardHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { authService } from '@/lib/api/services/authService';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated, setUser } = useAuthStore();

  // Protección de rutas: redirigir a login si no está autenticado
  // IMPORTANTE: Solo verificar DESPUÉS de que Zustand hidrate el estado desde localStorage
  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Refrescar perfil del usuario al cargar el dashboard para que los cambios
  // de empresa (company_id, allowed_company_ids) se reflejen sin re-login
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      authService.getCurrentUser().then(setUser).catch(() => {});
    }
  }, [hasHydrated, isAuthenticated]);

  // Mientras está hidratando o no está autenticado, no mostrar nada
  if (!hasHydrated || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
