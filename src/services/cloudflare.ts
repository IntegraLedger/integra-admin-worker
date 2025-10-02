import { Env } from '../types';

export async function getWorkersStatus(env: Env) {
  // Mock data based on actual workers
  return {
    workers: [
      {
        name: 'integra-data-service',
        status: 'active',
        requests24h: 15234,
        errors24h: 12,
        errorRate: '0.08%',
        p99LatencyMs: 45,
        lastDeployed: '2025-09-30T10:00:00Z'
      },
      {
        name: 'integra-identity-oracle',
        status: 'active',
        requests24h: 8456,
        errors24h: 5,
        errorRate: '0.06%',
        p99LatencyMs: 38,
        lastDeployed: '2025-09-30T22:16:00Z'
      },
      {
        name: 'blockchain-events-processor',
        status: 'active',
        requests24h: 45678,
        errors24h: 23,
        errorRate: '0.05%',
        p99LatencyMs: 52,
        lastDeployed: '2025-09-24T22:01:00Z'
      }
    ]
  };
}

export async function getPagesStatus(env: Env) {
  return {
    pages: [
      {
        name: 'integra-trust-platform',
        productionBranch: 'main',
        latestDeployment: {
          id: 'abc123',
          status: 'success',
          createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
          url: 'https://integra-trust-platform.pages.dev'
        },
        domains: [
          'trustwithintegra.com',
          'www.trustwithintegra.com',
          'adr.trustwithintegra.com',
          'aaa.trustwithintegra.com'
        ]
      },
      {
        name: 'integra-explorer-platform',
        productionBranch: 'main',
        latestDeployment: {
          id: 'def456',
          status: 'success',
          createdAt: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
          url: 'https://integra-explorer-platform.pages.dev'
        },
        domains: ['explorer.trustwithintegra.com']
      }
    ]
  };
}

export async function getDatabasesStatus(env: Env) {
  return {
    databases: {
      total: 520,
      core: [
        {
          id: 'bbaff76d-b046-4844-b395-cc910cb89af7',
          name: 'shared-registry-prod',
          sizeBytes: 122880,
          tableCount: 5,
          status: 'healthy'
        },
        {
          id: '800da95f-f074-4b56-a840-612d0c87f77b',
          name: 'pool-registry-prod',
          sizeBytes: 69632,
          tableCount: 3,
          status: 'healthy'
        },
        {
          id: '74a74f57-3823-4439-868d-deb0e363cebd',
          name: 'blockchain-index-prod',
          sizeBytes: 9863168,
          tableCount: 12,
          status: 'healthy'
        }
      ],
      orgDatabases: 517
    }
  };
}
