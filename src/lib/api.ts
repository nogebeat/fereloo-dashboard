/**
 * Fereloo API client — calls the FastAPI backend.
 *
 * Auth: Clerk JWT, injected via setTokenGetter() called at app startup.
 * All functions return the same shapes as the former mock (Tenant, TenantStatusResponse, …)
 * so no route code had to change.
 */
import {
  PROVISIONING_STEP_DEFS,
  type PlanId,
  type ProvisioningLog,
  type ProvisioningStep,
  type ProvisioningStepKey,
  type ProvisioningStepStatus,
  type Tenant,
  type TenantStatusResponse,
} from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

// ── Token plumbing ──────────────────────────────────────────────────────────

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function _token(): Promise<string | null> {
  return _getToken ? _getToken() : null;
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await _token();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const apiGet  = <T>(path: string) => apiFetch<T>(path, { method: 'GET' });
const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });

// ── Backend response types (raw) ────────────────────────────────────────────

interface RawTenant {
  id: string;
  subdomain: string;
  status: string;
  plan: string;
  createdAt: string;
  url: string;
  region: string;
}

interface RawStep {
  step: string;
  status: string; // in_progress | done | error | pending
  message: string | null;
  created_at: string | null;
}

interface RawProvisioningStatus {
  tenant_id: string;
  status: string;
  progress: number;
  current_step: string | null;
  steps: RawStep[];
}

// ── Shape adapters ──────────────────────────────────────────────────────────

function rawToTenant(r: RawTenant): Tenant {
  return {
    id: r.id,
    subdomain: r.subdomain,
    status: r.status as Tenant['status'],
    plan: r.plan as PlanId,
    createdAt: r.createdAt,
    url: r.url,
    region: r.region,
  };
}

function backendStatusToStep(rawStatus: string): ProvisioningStepStatus {
  switch (rawStatus) {
    case 'in_progress': return 'running';
    case 'done':        return 'success';
    case 'error':       return 'failed';
    default:            return 'pending';
  }
}

function mapLogLevel(rawStatus: string): ProvisioningLog['level'] {
  switch (rawStatus) {
    case 'done':        return 'success';
    case 'error':       return 'error';
    case 'in_progress': return 'info';
    default:            return 'info';
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function listTenants(): Promise<Tenant[]> {
  const raw = await apiGet<RawTenant[]>('/tenants');
  return raw.map(rawToTenant);
}

export async function getCurrentTenant(): Promise<Tenant | null> {
  const raw = await apiGet<RawTenant | null>('/tenants/current');
  return raw ? rawToTenant(raw) : null;
}

export async function getTenant(id: string): Promise<Tenant | null> {
  try {
    const raw = await apiGet<RawTenant>(`/tenants/${id}`);
    return rawToTenant(raw);
  } catch {
    return null;
  }
}

export async function checkSubdomainAvailable(subdomain: string): Promise<boolean> {
  const data = await apiGet<{ available: boolean }>(
    `/tenants/subdomain-check?subdomain=${encodeURIComponent(subdomain)}`,
  );
  return data.available;
}

export async function provisionTenant(input: {
  subdomain: string;
  plan: PlanId;
  region?: string;
  adminPassword: string;
}): Promise<Tenant> {
  const raw = await apiPost<RawProvisioningStatus>('/tenants/provision', {
    subdomain: input.subdomain,
    plan_id: input.plan,
    region: input.region ?? 'af-west-1',
    admin_password: input.adminPassword,
  });
  // The provision endpoint returns a ProvisioningStatusResponse; reconstruct a minimal Tenant.
  return {
    id: raw.tenant_id,
    subdomain: input.subdomain,
    status: 'provisioning',
    plan: input.plan,
    createdAt: new Date().toISOString(),
    url: `https://${input.subdomain}.fereloo.com`,
    region: input.region ?? 'af-west-1',
  };
}

export async function deleteTenant(id: string): Promise<void> {
  await apiFetch<{ deleted: boolean }>(`/tenants/${id}`, { method: 'DELETE' });
}

// Maps granular backend step names to frontend high-level step keys.
const STEP_GROUP: Record<string, ProvisioningStepKey> = {
  mariadb_create: 'mariadb',
  mariadb_deploy: 'mariadb',
  redis_create: 'redis',
  redis_deploy: 'redis',
  app_create: 'app',
  app_update: 'app',
  app_save_env: 'app',
  app_deploy: 'app',
  app_booting: 'booting',
  domain_create: 'domain',
};

function resolveGroupStatus(statuses: string[]): ProvisioningStepStatus {
  if (statuses.some((s) => s === 'error')) return 'failed';
  if (statuses.some((s) => s === 'in_progress')) return 'running';
  if (statuses.length > 0 && statuses.every((s) => s === 'done')) return 'success';
  return 'pending';
}

export async function getTenantStatus(tenantId: string): Promise<TenantStatusResponse | null> {
  try {
    const [tenant, statusData] = await Promise.all([
      getTenant(tenantId),
      apiGet<RawProvisioningStatus>(`/tenants/${tenantId}/status`),
    ]);

    if (!tenant) return null;

    // Group granular backend steps by high-level frontend key.
    const groupedStatuses = new Map<ProvisioningStepKey, string[]>();
    for (const l of statusData.steps) {
      const key = STEP_GROUP[l.step];
      if (key) {
        const arr = groupedStatuses.get(key) ?? [];
        arr.push(l.status);
        groupedStatuses.set(key, arr);
      }
    }

    const steps: ProvisioningStep[] = PROVISIONING_STEP_DEFS.map((def) => ({
      ...def,
      status: resolveGroupStatus(groupedStatuses.get(def.key as ProvisioningStepKey) ?? []),
    }));

    // Each backend step row becomes a log entry.
    const logs: ProvisioningLog[] = statusData.steps.map((l, i) => ({
      id: `${tenantId}-${l.step}-${i}`,
      timestamp: l.created_at ?? new Date().toISOString(),
      level: mapLogLevel(l.status),
      message: l.message ?? `[${l.step}] ${l.status}`,
    }));

    const errorMessage =
      statusData.status === 'failed'
        ? 'Le déploiement a échoué — consultez les logs pour le détail.'
        : undefined;

    return { tenant, progress: statusData.progress, steps, logs, errorMessage };
  } catch {
    return null;
  }
}
