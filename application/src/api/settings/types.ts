
export interface SettingsApiRequest {
  action: string;
  data?: any;
}

export interface SettingsApiResponse {
  status: number;
  json: {
    success: boolean;
    data?: any;
    message?: string;
  };
}

export interface SmtpSettings {
  enabled?: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  authMethod?: string;
  tls?: boolean;
  localName?: string;
}