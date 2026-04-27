/**
 * Mock Fereloo API — simulates the FastAPI backend that orchestrates
 * Frappe CRM provisioning (mariadb -> redis -> app -> domain).
 *
 * Drop-in migration to the real backend:
 *   - Replace each function with `fetch(import.meta.env.VITE_API_URL + ...)`.
 *   - Attach `Authorization: Bearer ${await clerk.session.getToken()}`.
 *   - Keep the same return shapes (Tenant, TenantStatusResponse).
 *
 * Mock state lives in localStorage so reloads don't lose tenants.
 * Provisioning is driven by elapsed wall-clock time per tenant (no setInterval),
 * so polling at any cadence converges to the same steps + logs.
 */
import {
  PROVISIONING_STEP_DEFS,
  type PlanId,
  type ProvisioningLog,
  type ProvisioningStep,
  type ProvisioningStepStatus,
  type Tenant,
  type TenantStatusResponse,
} from './types';

const STORAGE_KEY = 'fereloo:tenants';
const PROV_KEY = 'fereloo:prov';

/** ms duration per step in the mock (kept short for demo). */
const STEP_DURATION_MS: Record<string, number> = {
  mariadb: 4000,
  redis: 3000,
  app: 6000,
  domain: 4000,
};
const TOTAL_DURATION_MS = Object.values(STEP_DURATION_MS).reduce((a, b) => a + b, 0);

interface ProvState {
  startedAt: number; // epoch ms
  /** Optional forced failure on a specific step, for demo. */
  failOn?: keyof typeof STEP_DURATION_MS;
}

const SEED_TENANTS: Tenant[] = [
  {
    id: 'tnt_demo01',
    subdomain: 'kossam-cosmetics',
    status: 'active',
    plan: 'pro',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    url: 'https://kossam-cosmetics.fereloo.com',
    region: 'af-west-1',
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

function loadProv(): Record<string, ProvState> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PROV_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveProv(state: Record<string, ProvState>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROV_KEY, JSON.stringify(state));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Tenants                                                             */
/* ------------------------------------------------------------------ */

export async function listTenants(): Promise<Tenant[]> {
  await sleep(350);
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCurrentTenant(): Promise<Tenant | null> {
  // Backend would use the Clerk JWT to find "the user's tenant".
  // Mock: returns the most recent tenant, if any.
  await sleep(250);
  const all = load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all[0] ?? null;
}

export async function getTenant(id: string): Promise<Tenant | null> {
  await sleep(200);
  return load().find((t) => t.id === id) ?? null;
}

export async function checkSubdomainAvailable(subdomain: string): Promise<boolean> {
  await sleep(300);
  return !load().some((t) => t.subdomain.toLowerCase() === subdomain.toLowerCase());
}

export async function provisionTenant(input: {
  subdomain: string;
  plan: PlanId;
  region?: string;
}): Promise<Tenant> {
  await sleep(500);
  const tenant: Tenant = {
    id: 'tnt_' + Math.random().toString(36).slice(2, 10),
    subdomain: input.subdomain,
    status: 'provisioning',
    plan: input.plan,
    createdAt: new Date().toISOString(),
    url: `https://${input.subdomain}.fereloo.com`,
    region: input.region ?? 'af-west-1',
  };
  const all = load();
  all.unshift(tenant);
  save(all);
  // Mark provisioning start so subsequent polls compute progress from now.
  const prov = loadProv();
  prov[tenant.id] = { startedAt: Date.now() };
  saveProv(prov);
  return tenant;
}

export async function deleteTenant(id: string): Promise<void> {
  await sleep(250);
  save(load().filter((t) => t.id !== id));
  const prov = loadProv();
  delete prov[id];
  saveProv(prov);
}

/* ------------------------------------------------------------------ */
/* Provisioning status (polled)                                        */
/* ------------------------------------------------------------------ */

/** Per-step log scripts surfaced as wall-clock-driven entries. */
const STEP_LOGS: Record<string, Array<{ atRatio: number; level: ProvisioningLog['level']; message: string }>> = {
  mariadb: [
    { atRatio: 0.05, level: 'info', message: '[mariadb] Provisionnement de l\'instance MariaDB 11.4' },
    { atRatio: 0.45, level: 'info', message: '[mariadb] Création de l\'utilisateur applicatif et du schéma' },
    { atRatio: 0.95, level: 'success', message: '[mariadb] Instance prête sur 3306 ✓' },
  ],
  redis: [
    { atRatio: 0.10, level: 'info', message: '[redis] Démarrage de l\'instance Redis 7' },
    { atRatio: 0.85, level: 'success', message: '[redis] Connexion validée ✓' },
  ],
  app: [
    { atRatio: 0.05, level: 'info', message: '[frappe] Pull de l\'image frappe-crm:latest' },
    { atRatio: 0.30, level: 'info', message: '[frappe] bench new-site avec credentials générés' },
    { atRatio: 0.55, level: 'info', message: '[frappe] bench install-app crm' },
    { atRatio: 0.80, level: 'info', message: '[frappe] bench migrate' },
    { atRatio: 0.95, level: 'success', message: '[frappe] Application prête, pods 2/2 ready ✓' },
  ],
  domain: [
    { atRatio: 0.10, level: 'info', message: '[domain] Création du record DNS' },
    { atRatio: 0.50, level: 'info', message: '[domain] Configuration TLS via cert-manager' },
    { atRatio: 0.90, level: 'success', message: '[domain] Certificat délivré, ingress actif ✓' },
  ],
};

function computeStepsAtElapsed(elapsedMs: number): {
  steps: ProvisioningStep[];
  progress: number;
  done: boolean;
} {
  let cursor = 0;
  const steps: ProvisioningStep[] = PROVISIONING_STEP_DEFS.map((def) => {
    const dur = STEP_DURATION_MS[def.key];
    const start = cursor;
    const end = cursor + dur;
    cursor = end;
    let status: ProvisioningStepStatus = 'pending';
    if (elapsedMs >= end) status = 'success';
    else if (elapsedMs >= start) status = 'running';
    return { ...def, status };
  });
  const progress = Math.min(100, Math.round((elapsedMs / TOTAL_DURATION_MS) * 100));
  return { steps, progress, done: elapsedMs >= TOTAL_DURATION_MS };
}

function computeLogsAtElapsed(elapsedMs: number, tenantId: string): ProvisioningLog[] {
  const logs: ProvisioningLog[] = [
    {
      id: `${tenantId}-init`,
      timestamp: new Date(Date.now() - elapsedMs).toISOString(),
      level: 'info',
      message: '[init] Réception de la demande de provisioning',
    },
  ];
  let cursor = 0;
  for (const def of PROVISIONING_STEP_DEFS) {
    const dur = STEP_DURATION_MS[def.key];
    const start = cursor;
    cursor += dur;
    for (const entry of STEP_LOGS[def.key]) {
      const at = start + entry.atRatio * dur;
      if (elapsedMs >= at) {
        logs.push({
          id: `${tenantId}-${def.key}-${entry.atRatio}`,
          timestamp: new Date(Date.now() - (elapsedMs - at)).toISOString(),
          level: entry.level,
          message: entry.message,
        });
      }
    }
  }
  if (elapsedMs >= TOTAL_DURATION_MS) {
    logs.push({
      id: `${tenantId}-done`,
      timestamp: new Date().toISOString(),
      level: 'success',
      message: '[done] Tenant prêt et accessible',
    });
  }
  return logs;
}

/**
 * Polled status endpoint. Mirrors `GET /tenants/{tenant_id}/status`.
 * Calling this repeatedly returns increasing progress until completion,
 * at which point it flips the tenant to `active` in storage.
 */
export async function getTenantStatus(tenantId: string): Promise<TenantStatusResponse | null> {
  await sleep(180);
  const tenant = load().find((t) => t.id === tenantId);
  if (!tenant) return null;

  // Already-final states return a fully-resolved snapshot.
  if (tenant.status === 'active') {
    const finalSteps: ProvisioningStep[] = PROVISIONING_STEP_DEFS.map((d) => ({
      ...d,
      status: 'success',
    }));
    return {
      tenant,
      progress: 100,
      steps: finalSteps,
      logs: computeLogsAtElapsed(TOTAL_DURATION_MS, tenant.id),
    };
  }
  if (tenant.status === 'failed') {
    const failedSteps: ProvisioningStep[] = PROVISIONING_STEP_DEFS.map((d, i) => ({
      ...d,
      status: i === 0 ? 'success' : i === 1 ? 'failed' : 'pending',
    }));
    return {
      tenant,
      progress: 25,
      steps: failedSteps,
      logs: [],
      errorMessage: 'Échec lors du provisioning Redis. Réessayez.',
    };
  }

  // Provisioning in progress — compute from elapsed time.
  const prov = loadProv();
  let state = prov[tenantId];
  if (!state) {
    state = { startedAt: Date.now() };
    prov[tenantId] = state;
    saveProv(prov);
  }
  const elapsed = Date.now() - state.startedAt;
  const { steps, progress, done } = computeStepsAtElapsed(elapsed);
  const logs = computeLogsAtElapsed(elapsed, tenantId);

  if (done) {
    const all = load();
    const idx = all.findIndex((t) => t.id === tenantId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status: 'active' };
      save(all);
    }
    return {
      tenant: { ...tenant, status: 'active' },
      progress: 100,
      steps: steps.map((s) => ({ ...s, status: 'success' })),
      logs,
    };
  }

  return { tenant, progress, steps, logs };
}
