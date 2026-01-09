// Tipos para State (Estados/Provincias/Departamentos)

export interface State {
  id: number;
  name: string;
  code?: string; // Código del estado (ej: "CA" para California)
  country_id: number;
  is_active: boolean;
  created_at: string;
}

export interface StateListResponse {
  data: State[];
  total: number;
}
