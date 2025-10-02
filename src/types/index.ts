export interface Env {
  ADMIN_SESSIONS: KVNamespace;
  ADMIN_CACHE: KVNamespace;
  ENVIRONMENT: string;
  ADMIN_PASSWORD_PLAINTEXT: string;
  JWT_SECRET?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  DO_API_TOKEN?: string;
  RABBITMQ_URL?: string;
  RABBITMQ_USER?: string;
  RABBITMQ_PASS?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}
