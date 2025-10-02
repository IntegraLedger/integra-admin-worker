import { Env } from '../types';

export interface CacheConfig {
  ttl: number; // in seconds
  key: string;
}

export async function getCachedData<T>(
  env: Env,
  config: CacheConfig
): Promise<T | null> {
  try {
    const cached = await env.ADMIN_CACHE.get(config.key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }
  return null;
}

export async function setCachedData<T>(
  env: Env,
  config: CacheConfig,
  data: T
): Promise<void> {
  try {
    await env.ADMIN_CACHE.put(
      config.key,
      JSON.stringify(data),
      { expirationTtl: config.ttl }
    );
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export function generateCacheKey(endpoint: string, params?: Record<string, string>): string {
  const paramStr = params ? Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') : '';
  const timestamp = Math.floor(Date.now() / 1000);
  return `${endpoint}:${paramStr}:${timestamp}`;
}

export const CACHE_TTL = {
  OVERVIEW: 30,
  K8S_STATUS: 60,
  K8S_NAMESPACE: 60,
  WORKERS: 300,
  PAGES: 300,
  DATABASES: 300,
  QUEUES: 30,
  RPC: 60,
  ALERTS: 60,
} as const;
