'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/authStore';
import { ROLE_NAMES } from '@/lib/types/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { label: 'Gestión de Usuarios', href: '/admin/users', roles: [1, 2] },
  { label: 'Crear Vale', href: '/my-vouchers/create', roles: [1, 2, 3, 4, 5, 6] },
  { label: 'Mis Vales', href: '/my-vouchers', roles: [1, 2, 3, 4, 5, 6] },
  { label: 'Aprobar Salidas', href: '/vouchers/approve', roles: [1, 2, 3] },
  { label: 'Check de Salida', href: '/vouchers/validate-exit', roles: [1, 2, 3, 6] },
  { label: 'Confirmar Entradas', href: '/vouchers/confirm-entry', roles: [1, 2, 3, 6] },
  { label: 'Compañías', href: '/misc/companies', roles: [1, 2, 3] },
  { label: 'Sucursales', href: '/misc/branches', roles: [1, 2, 3] },
  { label: 'Productos', href: '/misc/products', roles: [1, 2, 3] },
];

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const visibleItems = useMemo(() => {
    if (!user) return [];
    return menuItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6">
      {/* Left: Hamburger (móvil) + Título (escritorio) */}
      <div className="flex items-center gap-3">
        {/* Menú hamburguesa - solo visible en móvil */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {visibleItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h2 className="hidden md:block text-lg font-semibold text-neutral-900">Panel de usuario</h2>
      </div>

      {/* Right: Info de usuario + Cerrar Sesión */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Info de usuario */}
        <div className="flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 bg-neutral-50 rounded-lg">
          <div className="h-7 w-7 md:h-8 md:w-8 bg-neutral-900 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs md:text-sm font-medium text-neutral-900">{user.email}</p>
            <p className="text-xs text-neutral-500">{ROLE_NAMES[user.role]}</p>
          </div>
        </div>

        {/* Botón Cerrar Sesión - oculto en móvil (está en el hamburguesa) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
