// Tipos para Country (Países)

export interface Country {
  id: number;
  name: string;
  iso_code: string; // ISO 3166-1 alpha-2 (2 letras)
  iso_code_3: string; // ISO 3166-1 alpha-3 (3 letras)
  phone_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface CountryListResponse {
  data: Country[];
  total: number;
}
