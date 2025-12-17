// Tipos para CRUD de usuarios

export interface User {
  id: number;
  email: string;
  name: string; // Nombre del usuario
  role: number; // 1=Admin, 2=Manager, 3=Collaborator, 4=Reader, 5=Guest, 6=Checker
  individual_id?: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  role: number;
  individual_id?: number;
  is_active?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  password?: string;
  role?: number;
  individual_id?: number;
  is_active?: boolean;
}

export interface UserFilters {
  role?: number;
  is_active?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Mapeo de roles a nombres
export const ROLE_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Gerente',
  3: 'Colaborador',
  4: 'Lector',
  5: 'Guest',
  6: 'Vigilante',
};

// Opciones de roles para select
export const ROLE_OPTIONS = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Gerente' },
  { value: 3, label: 'Colaborador' },
  { value: 4, label: 'Lector' },
  { value: 5, label: 'Guest' },
  { value: 6, label: 'Vigilante' },
];

// Helper para obtener nombre de rol
export const getRoleName = (role: number): string => {
  return ROLE_NAMES[role] || 'Desconocido';
};

// Helper para verificar permisos
export const canAccessAdminUsers = (role: number) => [1, 2].includes(role);
export const canEditUser = (role: number) => [1, 2].includes(role);
export const canDeleteUser = (role: number) => [1].includes(role); // Solo Admin
export const canCreateUser = (role: number) => [1, 2].includes(role);
