// Tipos para Company (Empresas)

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'waiting';
export type TaxSystem = 'RFC' | 'EIN' | 'NIF' | 'VAT' | 'CUIL' | 'CUIT' | 'RUC' | 'RUT' | 'CNPJ' | 'OTHER';

export interface Company {
  id: number;
  company_name: string;
  legal_name?: string;
  tin: string; // Tax Identification Number
  tax_system: TaxSystem;
  country_id: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: CompanyStatus;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  deleted_at?: string;
  deleted_by?: number;
}

export interface CompanyCreateInput {
  company_name: string;
  legal_name?: string;
  tin: string;
  tax_system: TaxSystem;
  country_id: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: CompanyStatus;
}

export interface CompanyUpdateInput {
  company_name?: string;
  legal_name?: string;
  tin?: string;
  tax_system?: TaxSystem;
  country_id?: number;
  state_id?: number;
  city?: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: CompanyStatus;
}

export interface CompanyWithRelations extends Company {
  country_name?: string;
  state_name?: string;
  creator_name?: string;
  updater_name?: string;
}

export interface CompanyListResponse {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data: Company[];
}

export interface CompanySearch {
  search_term?: string;
  country_id?: number;
  state_id?: number;
  status?: CompanyStatus;
  tax_system?: TaxSystem;
}

// Nombres en español para estados de empresa
export const COMPANY_STATUS_NAMES: Record<CompanyStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  suspended: 'Suspendida',
  waiting: 'En Espera',
};

// Nombres en español para sistemas fiscales
export const TAX_SYSTEM_NAMES: Record<TaxSystem, string> = {
  RFC: 'RFC (México)',
  EIN: 'EIN (USA)',
  NIF: 'NIF (España)',
  VAT: 'VAT (Reino Unido)',
  CUIL: 'CUIL (Colombia)',
  CUIT: 'CUIT (Argentina)',
  RUC: 'RUC (Perú/Ecuador)',
  RUT: 'RUT (Chile)',
  CNPJ: 'CNPJ (Brasil)',
  OTHER: 'Otro',
};

// Helper functions
export const getCompanyStatusName = (status: CompanyStatus): string => {
  return COMPANY_STATUS_NAMES[status] || status;
};

export const getTaxSystemName = (taxSystem: TaxSystem): string => {
  return TAX_SYSTEM_NAMES[taxSystem] || taxSystem;
};
