'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { ROLE_NAMES } from '@/lib/types/auth';

export default function HomePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          ¡Bienvenido al Sistema de Vales!
        </h1>
        <p className="text-neutral-600">
          Usuario: <strong>{user.email}</strong> | Rol:{' '}
          <strong>{ROLE_NAMES[user.role]}</strong>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Vales Pendientes
          </h3>
          <p className="text-3xl font-bold text-neutral-900">-</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Vales en Tránsito
          </h3>
          <p className="text-3xl font-bold text-neutral-900">-</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">
            Vales Completados
          </h3>
          <p className="text-3xl font-bold text-neutral-900">-</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Sistema MVP en Desarrollo
        </h3>
        <p className="text-sm text-blue-700">
          Este es un prototipo funcional del sistema de gestión de vales. Utiliza
          el menú lateral para navegar entre los módulos disponibles según tu rol.
        </p>
      </div>
    </div>
  );
}
