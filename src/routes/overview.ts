import { Env } from '../types';
import { jsonResponse } from '../utils/response';
import { getCachedData, setCachedData, CACHE_TTL } from '../middleware/cache';
import { getK8sStatus } from '../services/kubernetes';
import { getWorkersStatus, getPagesStatus, getDatabasesStatus } from '../services/cloudflare';
import { getQueuesStatus } from '../services/rabbitmq';

export async function handleOverview(request: Request, env: Env): Promise<Response> {
  const cacheKey = 'overview:all';

  // Check cache
  const cached = await getCachedData(env, { key: cacheKey, ttl: CACHE_TTL.OVERVIEW });
  if (cached) {
    return jsonResponse(cached);
  }

  // Fetch data from all sources in parallel
  const [k8s, workers, pages, databases, queues] = await Promise.all([
    getK8sStatus(env),
    getWorkersStatus(env),
    getPagesStatus(env),
    getDatabasesStatus(env),
    getQueuesStatus(env)
  ]);

  const overview = {
    timestamp: new Date().toISOString(),
    kubernetes: {
      status: k8s.cluster.status,
      nodes: {
        total: k8s.nodes.total,
        ready: k8s.nodes.ready
      },
      pods: {
        total: k8s.pods.running + k8s.pods.pending + k8s.pods.failed,
        running: k8s.pods.running,
        pending: k8s.pods.pending,
        failed: k8s.pods.failed
      }
    },
    workers: {
      total: workers.workers.length,
      healthy: workers.workers.filter((w: any) => w.status === 'active').length,
      errors: 0,
      status: 'healthy' as const
    },
    pages: {
      deployments: pages.pages.length,
      status: 'healthy' as const
    },
    databases: {
      total: databases.databases.total,
      status: 'healthy' as const
    },
    queues: {
      totalMessages: queues.summary.totalMessages,
      consumers: queues.summary.totalConsumers,
      status: 'healthy' as const
    }
  };

  // Cache for 30 seconds
  await setCachedData(env, { key: cacheKey, ttl: CACHE_TTL.OVERVIEW }, overview);

  return jsonResponse(overview);
}
