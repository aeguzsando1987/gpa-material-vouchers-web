// Tipos de autenticación

export interface User {
  id: number;
  email: string;
  name: string; // Nombre del usuario
  role: number; // 1=Admin, 2=Manager, 3=Collaborator, 4=Reader, 5=Guest, 6=Checker
  individual_id?: number;
  company_id?: number;
  allowed_company_ids?: number[];
  accessible_company_ids?: number[];
  is_io_manager?: boolean; // ¿es contralor? Habilita la 2ª aprobación (gate real en backend)
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mapeo de roles a nombres
export const ROLE_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Gerente',
  3: 'Supervisor',
  4: 'Lector',
  5: 'Invitado',
  6: 'Vigilante',
};

// Helper para verificar permisos por rol
export const canAccessAdminUsers = (role: number) => [1, 2].includes(role);
export const canApproveVouchers = (role: number) => [1, 2, 3].includes(role);
// La 2ª aprobación (contraloría) NO depende del rol, sino de ser contralor (io manager).
export const isIOManager = (user?: { is_io_manager?: boolean } | null) => !!user?.is_io_manager;
// Check de Salida y Confirmar Entradas: solo Admin (1) y Vigilante (6)
export const canCheckExits = (role: number) => [1, 6].includes(role);
export const canManageMisc = (role: number) => [1, 2, 3].includes(role);
