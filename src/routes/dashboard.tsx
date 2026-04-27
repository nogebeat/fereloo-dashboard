import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Plus, ExternalLink, Activity, Server } from 'lucide-react';
import { listTenants } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { AppShell } from '@/components/app-shell';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tenant } from '@/lib/types';

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Tenants — Fereloo Console' },
      { name: 'description', content: 'Vue d\'ensemble des tenants actifs et de leur statut.' },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: '/' });
    }
  }, [user, loading, router]);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
    refetchInterval: 5000,
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <DashboardContent tenants={tenants} isLoading={isLoading} />
    </AppShell>
  );
}

function DashboardContent({
  tenants,
  isLoading,
}: {
  tenants: Tenant[] | undefined;
  isLoading: boolean;
}) {
  const navigate = useNavigate();

  const stats = {
    total: tenants?.length ?? 0,
    active: tenants?.filter((t) => t.status === 'active').length ?? 0,
    provisioning: tenants?.filter((t) => t.status === 'provisioning').length ?? 0,
    failed: tenants?.filter((t) => t.status === 'failed').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Liste de toutes les instances provisionnées sur la plateforme.
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/tenants/new' })} className="glow-primary">
          <Plus className="h-4 w-4" />
          Nouveau tenant
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={<Server className="h-4 w-4" />} />
        <StatCard
          label="Actifs"
          value={stats.active}
          icon={<Activity className="h-4 w-4 text-success" />}
          tone="success"
        />
        <StatCard
          label="En cours"
          value={stats.provisioning}
          icon={<Activity className="h-4 w-4 text-primary" />}
          tone="primary"
        />
        <StatCard
          label="Échecs"
          value={stats.failed}
          icon={<Activity className="h-4 w-4 text-destructive" />}
          tone="destructive"
        />
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium">Instances</h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : !tenants || tenants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border">
            {tenants.map((t) => (
              <TenantRow key={t.id} tenant={t} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'success' | 'primary' | 'destructive';
}) {
  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <div
        className={`mt-2 text-2xl font-semibold ${
          tone === 'success'
            ? 'text-success'
            : tone === 'primary'
              ? 'text-primary'
              : tone === 'destructive'
                ? 'text-destructive'
                : ''
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
  const isLive = tenant.status === 'active';
  const isProvisioning = tenant.status === 'provisioning';

  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary font-mono text-xs uppercase">
        {tenant.subdomain.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{tenant.subdomain}</span>
          <StatusBadge status={tenant.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>{tenant.url.replace('https://', '')}</span>
          <span>·</span>
          <span className="uppercase">{tenant.plan}</span>
          <span>·</span>
          <span>{tenant.region}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isProvisioning && (
          <Button asChild size="sm" variant="outline">
            <Link to="/tenants/$tenantId" params={{ tenantId: tenant.id }}>
              <Activity className="h-3.5 w-3.5" />
              Suivre
            </Link>
          </Button>
        )}
        {isLive && (
          <Button asChild size="sm" variant="outline">
            <a href={tenant.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Ouvrir
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
        <Server className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium">Aucun tenant pour le moment</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Créez votre premier tenant pour démarrer le déploiement automatisé.
      </p>
    </div>
  );
}
