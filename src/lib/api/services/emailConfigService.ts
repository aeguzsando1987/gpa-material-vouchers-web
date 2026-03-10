import apiClient from '../client';

export interface EmailConfig {
  enabled: boolean;
  server: string;
  port: number;
  username: string;
  password_set: boolean;
  from_email: string;
  from_name: string;
  use_tls: boolean;
  source: string; // "database" | "env"
}

export interface EmailConfigUpdate {
  enabled: boolean;
  server: string;
  port: number;
  username: string;
  password?: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

const emailConfigService = {
  getConfig: async (): Promise<EmailConfig> => {
    const response = await apiClient.get('/admin/email-config/');
    return response.data;
  },

  saveConfig: async (data: EmailConfigUpdate): Promise<{ message: string }> => {
    const response = await apiClient.put('/admin/email-config/', data);
    return response.data;
  },

  sendTestEmail: async (recipient: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/admin/email-config/test', { recipient });
    return response.data;
  },
};

export default emailConfigService;
