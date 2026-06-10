// Tipos para Contralores (IO Managers)

export interface IOManager {
  id: number;
  individual_id: number;
  is_active: boolean;
  created_at: string;
  created_by?: number;
  individual_name?: string;
  individual_email?: string;
}

export interface IOManagerCreateInput {
  individual_id: number;
}
