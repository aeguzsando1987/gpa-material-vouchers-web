// Tipos para Individual + User creation

// Individual básico (para búsqueda)
export interface Individual {
  id: number;
  user_id?: number;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  is_active: boolean;
  created_at: string;
  direct_supervisor_id?: number | null;
  io_manager_id?: number | null;
  direct_supervisor_name?: string | null;
  io_manager_name?: string | null;
}

export interface IndividualWithUserInput {
  // Datos del usuario
  user_email: string;
  user_name: string;
  user_password: string;
  user_role: number;

  // Datos del individuo (obligatorios)
  name: string;
  last_name: string;
  email: string;

  // Datos del individuo (opcionales)
  phone?: string;
  address?: string;
  status?: string;

  // Empresa (solo Admin puede asignar)
  company_id?: number;
  allowed_company_ids?: number[];
}

export interface IndividualWithUserResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: number;
    is_active: boolean;
  };
  individual: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone?: string;
    user_id: number;
  };
}

// Para crear un Individual independiente (sin crear usuario)
export interface IndividualCreateInput {
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  user_id?: number; // Para asociar a un usuario existente
}

// Para actualizar un Individual existente
export interface IndividualUpdateInput {
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  company_id?: number;
  allowed_company_ids?: number[];
  direct_supervisor_id?: number | null;
  io_manager_id?: number | null;
}
