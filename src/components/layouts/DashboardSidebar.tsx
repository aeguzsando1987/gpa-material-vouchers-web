'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  CheckSquare,
  ClipboardCheck,
  FolderPlus,
  FileStack,
  Building2,
  MapPin,
  Package,
  PackageCheck,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: number[]; // Roles que pueden acceder
}

const menuItems: MenuItem[] = [
  // Administración de Usuarios
  {
    label: 'Gestión de Usuarios',
    href: '/admin/users',
    icon: Users,
    roles: [1, 2], // Admin, Manager
  },

  // Panel de Usuario (todos)
  {
    label: 'Crear Vale',
    href: '/my-vouchers/create',
    icon: FolderPlus,
    roles: [1, 2, 3, 4, 5, 6],
  },
  {
    label: 'Mis Vales',
    href: '/my-vouchers',
    icon: FileStack,
    roles: [1, 2, 3, 4, 5, 6],
  },

  // Administrar Vales
  {
    label: 'Aprobar Salidas',
    href: '/vouchers/approve',
    icon: CheckSquare,
    roles: [1, 2, 3], // Admin, Manager, Collaborator
  },
  {
    label: 'Check de Salida',
    href: '/vouchers/validate-exit',
    icon: ClipboardCheck,
    roles: [1, 6], // Admin, Vigilante
  },
  {
    label: 'Confirmar Entradas',
    href: '/vouchers/confirm-entry',
    icon: PackageCheck,
    roles: [1, 6], // Admin, Vigilante
  },

  // Administración del sistema
  {
    label: 'Contralores',
    href: '/admin/io-managers',
    icon: ShieldCheck,
    roles: [1], // Solo Admin
  },
  {
    label: 'Config. Correo',
    href: '/admin/email-config',
    icon: Mail,
    roles: [1], // Solo Admin
  },

  // Misceláneos
  {
    label: 'Compañías',
    href: '/misc/companies',
    icon: Building2,
    roles: [1, 2, 3],
  },
  {
    label: 'Sucursales',
    href: '/misc/branches',
    icon: MapPin,
    roles: [1, 2, 3],
  },
  {
    label: 'Productos',
    href: '/misc/products',
    icon: Package,
    roles: [1, 2, 3],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Filtrar items del menú según el rol del usuario
  const visibleItems = useMemo(() => {
    if (!user) return [];
    return menuItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  if (!user) return null;

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-neutral-200 flex-col z-20">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
        <Image
          src="/logo-gpa.png"
          alt="Logo GPA"
          width={48}
          height={48}
          className="object-contain flex-shrink-0"
          priority
        />
        <div>
          <h1 className="text-sm font-bold text-neutral-900 leading-tight">Sistema de Vales</h1>
          <p className="text-xs text-neutral-500">Gestión de Material</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-400 text-center">
          © 2025 Sistema de Vales de entrada y salida de material GPA. Todos los derechos reservados.
        </p>
      </div>
    </aside>
  );
}
