/**
 * Mock Fereloo API — simulates the FastAPI backend.
 * To migrate: replace each function body with a `fetch(import.meta.env.VITE_API_URL + ...)` call.
 *
 * All operations persist in localStorage to mimic a real backend across reloads.
 */
import type { PlanId, ProvisioningLog, Tenant, TenantStatus } from './types';

const STORAGE_KEY = 'fereloo:tenants';

const SEED_TENANTS: Tenant[] = [
  {
    id: 'tnt_a1b2c3',
    subdomain: 'acme-corp',
    status: 'active',
    plan: 'pro',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    url: 'https://acme-corp.fereloo.com',
    region: 'eu-west-1',
  },
  {
    id: 'tnt_d4e5f6',
    subdomain: 'demo-tenant',
    status: 'active',
    plan: 'basic',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    url: 'https://demo-tenant.fereloo.com',
    region: 'eu-west-1',
  },
  {
    id: 'tnt_g7h8i9',
    subdomain: 'globex',
    status: 'failed',
    plan: 'enterprise',
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    url: 'https://globex.fereloo.com',
    region: 'eu-central-1',
  },
];

function load(): Tenant[] {
  if (typeof window === 'undefined') return SEED_TENANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TENANTS));
      return SEED_TENANTS;
    }
    return JSON.parse(raw) as Tenant[];
  } catch {
    return SEED_TENANTS;
  }
}

function save(tenants: Tenant[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listTenants(): Promise<Tenant[]> {
  await sleep(450);
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTenant(id: string): Promise<Tenant | null> {
  await sleep(250);
  return load().find((t) => t.id === id) ?? null;
}

export async function checkSubdomainAvailable(subdomain: string): Promise<boolean> {
  await sleep(350);
  const taken = load().some((t) => t.subdomain.toLowerCase() === subdomain.toLowerCase());
  return !taken;
}

export async function createTenant(input: {
  subdomain: string;
  plan: PlanId;
  region?: string;
}): Promise<Tenant> {
  await sleep(600);
  const tenant: Tenant = {
    id: 'tnt_' + Math.random().toString(36).slice(2, 10),
    subdomain: input.subdomain,
    status: 'provisioning',
    plan: input.plan,
    createdAt: new Date().toISOString(),
    url: `https://${input.subdomain}.fereloo.com`,
    region: input.region ?? 'eu-west-1',
  };
  const all = load();
  all.unshift(tenant);
  save(all);
  return tenant;
}

function updateTenantStatus(id: string, status: TenantStatus) {
  const all = load();
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], status };
    save(all);
  }
}

/**
 * Simulates a server-sent log stream for a provisioning tenant.
 * Returns an unsubscribe function. Calls onLog with each new log entry,
 * onProgress with the percentage (0-100), and onDone when finished.
 */
export function streamProvisioningLogs(
  tenantId: string,
  callbacks: {
    onLog: (log: ProvisioningLog) => void;
    onProgress: (progress: number, step: string) => void;
    onDone: (status: 'active' | 'failed') => void;
  },
): () => void {
  const steps: Array<{ message: string; level: ProvisioningLog['level']; delay: number }> = [
    { message: '[init] Validation des paramètres du tenant', level: 'info', delay: 600 },
    { message: '[dns] Allocation du sous-domaine *.fereloo.com', level: 'info', delay: 900 },
    { message: '[dns] Sous-domaine alloué ✓', level: 'success', delay: 400 },
    { message: '[k8s] Création du namespace Kubernetes', level: 'info', delay: 700 },
    { message: '[mariadb] Provisionnement de l\'instance MariaDB 11.4', level: 'info', delay: 1400 },
    { message: '[mariadb] Initialisation du schéma applicatif', level: 'info', delay: 900 },
    { message: '[mariadb] Instance prête sur le port interne 3306 ✓', level: 'success', delay: 500 },
    { message: '[storage] Montage du volume persistant (50Gi)', level: 'info', delay: 800 },
    { message: '[app] Déploiement de l\'image fereloo/runtime:latest', level: 'info', delay: 1100 },
    { message: '[app] Pods 2/2 ready', level: 'success', delay: 600 },
    { message: '[ingress] Configuration TLS via cert-manager', level: 'info', delay: 900 },
    { message: '[ingress] Certificat Let\'s Encrypt délivré ✓', level: 'success', delay: 500 },
    { message: '[health] Vérification des endpoints /healthz', level: 'info', delay: 700 },
    { message: '[health] Tous les checks passent ✓', level: 'success', delay: 400 },
    { message: '[done] Tenant prêt et accessible', level: 'success', delay: 300 },
  ];

  let cancelled = false;
  let current = 0;

  (async () => {
    for (let i = 0; i < steps.length; i++) {
      if (cancelled) return;
      const step = steps[i];
      await sleep(step.delay);
      if (cancelled) return;
      current = i + 1;
      const log: ProvisioningLog = {
        id: `${tenantId}-${i}`,
        timestamp: new Date().toISOString(),
        level: step.level,
        message: step.message,
      };
      callbacks.onLog(log);
      callbacks.onProgress(Math.round((current / steps.length) * 100), step.message);
    }
    if (!cancelled) {
      updateTenantStatus(tenantId, 'active');
      callbacks.onDone('active');
    }
  })();

  return () => {
    cancelled = true;
  };
}

export async function deleteTenant(id: string): Promise<void> {
  await sleep(300);
  save(load().filter((t) => t.id !== id));
}
