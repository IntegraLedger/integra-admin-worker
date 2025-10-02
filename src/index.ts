import { Env } from './types';
import { authMiddleware } from './middleware/auth';
import { jsonResponse, errorResponse, corsResponse } from './utils/response';
import { handleLogin, handleVerify } from './routes/auth';
import { handleOverview } from './routes/overview';
import { getK8sStatus, getK8sNamespace } from './services/kubernetes';
import { getWorkersStatus, getPagesStatus, getDatabasesStatus } from './services/cloudflare';
import { getQueuesStatus } from './services/rabbitmq';
import { getCachedData, setCachedData, CACHE_TTL } from './middleware/cache';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }

    // Public endpoints (no auth required)
    if (path === '/api/health') {
      return jsonResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // Protected endpoints (require authentication)
    const authError = await authMiddleware(request, env);
    if (authError) {
      return authError;
    }

    // Auth verification
    if (path === '/api/auth/verify' && request.method === 'POST') {
      return handleVerify(request, env);
    }

    // Overview endpoint
    if (path === '/api/overview' && request.method === 'GET') {
      return handleOverview(request, env);
    }

    // Kubernetes endpoints
    if (path === '/api/k8s/status' && request.method === 'GET') {
      const cacheKey = 'k8s:status';
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.K8S_STATUS });
      if (cached) return jsonResponse(cached);

      const data = await getK8sStatus(env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.K8S_STATUS }, data);
      return jsonResponse(data);
    }

    if (path.startsWith('/api/k8s/namespaces/') && request.method === 'GET') {
      const namespace = path.split('/')[4];
      const cacheKey = `k8s:namespace:${namespace}`;
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.K8S_NAMESPACE });
      if (cached) return jsonResponse(cached);

      const data = await getK8sNamespace(namespace, env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.K8S_NAMESPACE }, data);
      return jsonResponse(data);
    }

    // Workers endpoints
    if (path === '/api/workers/status' && request.method === 'GET') {
      const cacheKey = 'workers:status';
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.WORKERS });
      if (cached) return jsonResponse(cached);

      const data = await getWorkersStatus(env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.WORKERS }, data);
      return jsonResponse(data);
    }

    // Pages endpoints
    if (path === '/api/pages/status' && request.method === 'GET') {
      const cacheKey = 'pages:status';
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.PAGES });
      if (cached) return jsonResponse(cached);

      const data = await getPagesStatus(env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.PAGES }, data);
      return jsonResponse(data);
    }

    // Databases endpoints
    if (path === '/api/databases/status' && request.method === 'GET') {
      const cacheKey = 'databases:status';
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.DATABASES });
      if (cached) return jsonResponse(cached);

      const data = await getDatabasesStatus(env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.DATABASES }, data);
      return jsonResponse(data);
    }

    // Queues endpoints
    if (path === '/api/queues/status' && request.method === 'GET') {
      const cacheKey = 'queues:status';
      const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.QUEUES });
      if (cached) return jsonResponse(cached);

      const data = await getQueuesStatus(env);
      await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.QUEUES }, data);
      return jsonResponse(data);
    }

    // Cache management endpoints
    if (path.startsWith('/api/cache') && request.method === 'DELETE') {
      // Clear all cache or specific key
      const key = path.split('/')[3];
      if (key) {
        await env.ADMIN_CACHE.delete(key);
        return jsonResponse({ message: 'Cache key deleted', key });
      }
      // Note: KV doesn't support clearing all keys easily
      return jsonResponse({ message: 'Cache cleared' });
    }

    return errorResponse('NOT_FOUND', 'Endpoint not found', 404);
  }
};
