'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/authStore';
import { ROLE_NAMES } from '@/lib/types/auth';

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      {/* Left: Page Title (could be dynamic) */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Panel de usuario</h2>
      </div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-lg">
          <div className="h-8 w-8 bg-neutral-900 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{user.email}</p>
            <p className="text-xs text-neutral-500">{ROLE_NAMES[user.role]}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
