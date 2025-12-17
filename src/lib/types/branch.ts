// Tipos para Branch (Sucursales/Ubicaciones)

export type BranchType = 'warehouse' | 'project' | 'plant' | 'office' | 'site';
export type OperationalStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  branch_type: BranchType;
  description?: string;
  company_id: number;
  country_id: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_id?: number;
  latitude?: string;
  longitude?: string;
  operational_status: OperationalStatus;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
  deleted_by?: number;
}

export interface BranchCreateInput {
  branch_code: string;
  branch_name: string;
  branch_type: BranchType;
  description?: string;
  company_id: number;
  country_id: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_id?: number;
  latitude?: string;
  longitude?: string;
  operational_status?: OperationalStatus;
}

export interface BranchUpdateInput {
  branch_code?: string;
  branch_name?: string;
  branch_type?: BranchType;
  description?: string;
  company_id?: number;
  country_id?: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_id?: number;
  latitude?: string;
  longitude?: string;
  operational_status?: OperationalStatus;
}

export interface BranchWithRelations extends Branch {
  company_name?: string;
  country_name?: string;
  state_name?: string;
  manager_name?: string;
  creator_name?: string;
  updater_name?: string;
}

export interface BranchListResponse {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data: Branch[];
}

export interface BranchSearch {
  search_term?: string;
  branch_type?: BranchType;
  company_id?: number;
  country_id?: number;
  state_id?: number;
  operational_status?: OperationalStatus;
  active_only?: boolean;
}

// Nombres en español para tipos de sucursal
export const BRANCH_TYPE_NAMES: Record<BranchType, string> = {
  warehouse: 'Almacén',
  project: 'Proyecto/Obra',
  plant: 'Planta Industrial',
  office: 'Oficina',
  site: 'Sitio Temporal',
};

// Nombres en español para estados operativos
export const OPERATIONAL_STATUS_NAMES: Record<OperationalStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  maintenance: 'En Mantenimiento',
  closed: 'Cerrada',
};

// Helper functions
export const getBranchTypeName = (type: BranchType): string => {
  return BRANCH_TYPE_NAMES[type] || type;
};

export const getOperationalStatusName = (status: OperationalStatus): string => {
  return OPERATIONAL_STATUS_NAMES[status] || status;
};
