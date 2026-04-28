import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  Plus,
  ExternalLink,
  Activity,
  Server,
  Rocket,
  Sparkles,
  Database,
  Globe,
} from 'lucide-react';
import { getCurrentTenant, listTenants } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { AppShell } from '@/components/app-shell';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PLANS, type Tenant } from '@/lib/types';

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Tableau de bord — Fereloo' },
      {
        name: 'description',
        content:
          'Vos instances Frappe CRM provisionnées sur Fereloo : statut, plan et accès direct.',
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: '/' });
  }, [user, loading, router]);

  const { data: currentTenant, isLoading: loadingCurrent } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: getCurrentTenant,
    refetchInterval: 5000,
    enabled: !!user,
  });

  const { data: tenants, isLoading: loadingList } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
    refetchInterval: 5000,
    enabled: !!user,
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isLoading = loadingCurrent || loadingList;

  return (
    <AppShell>
      {isLoading ? (
        <DashboardSkeleton />
      ) : !currentTenant ? (
        <NoTenantState />
      ) : (
        <TenantOverview current={currentTenant} all={tenants ?? []} />
      )}
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function NoTenantState() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Bienvenue sur Fereloo
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Provisionnez votre instance Frappe CRM
        </h1>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          Vous n'avez pas encore d'instance. Choisissez un plan et un sous-domaine — votre CRM
          sera prêt en 90 secondes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Database, label: 'MariaDB' },
          { icon: Server, label: 'Redis' },
          { icon: Globe, label: 'TLS auto' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      <Card className="border-primary/30 bg-card p-6 glow-primary">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold">Lancer le provisioning</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sous-domaine, plan, déploiement automatisé.
            </p>
          </div>
          <Button asChild className="glow-primary">
            <Link to="/provision">
              <Rocket className="h-4 w-4" />
              Démarrer
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TenantOverview({ current, all }: { current: Tenant; all: Tenant[] }) {
  const planObj = PLANS.find((p) => p.id === current.plan)!;
  const others = all.filter((t) => t.id !== current.id);
  const activeCount = all.filter((t) => t.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Votre instance Frappe CRM en un coup d'œil.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/provision">
            <Plus className="h-4 w-4" />
            Nouvelle instance
          </Link>
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Instances',
            value: String(all.length),
            sub: `${activeCount} active${activeCount > 1 ? 's' : ''}`,
          },
          {
            label: 'Plan actif',
            value: planObj.name,
            sub: `${planObj.users} utilisateurs`,
          },
          {
            label: 'Région',
            value: current.region.toUpperCase(),
            sub: 'Hébergé en Afrique',
          },
          {
            label: 'Stockage',
            value: `${planObj.storageGb} Go`,
            sub: 'Inclus dans le plan',
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card px-4 py-3.5"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 font-display text-xl font-bold leading-none">{value}</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{sub}</p>
          </div>
        ))}
      </div>

      <CurrentTenantCard tenant={current} planLabel={planObj.name} />

      {others.length > 0 && (
        <Card className="overflow-hidden border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Autres instances</h2>
          </div>
          <div className="divide-y divide-border">
            {others.map((t) => (
              <TenantRow key={t.id} tenant={t} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function CurrentTenantCard({ tenant, planLabel }: { tenant: Tenant; planLabel: string }) {
  const isActive = tenant.status === 'active';
  const isProv = tenant.status === 'provisioning';
  const isFailed = tenant.status === 'failed';

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Top accent line for active instances */}
      {isActive && <div className="h-px bg-primary/40" />}

      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-display text-base font-bold uppercase text-primary">
              {tenant.subdomain.slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold">{tenant.subdomain}</h2>
                <StatusBadge status={tenant.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {tenant.url.replace('https://', '')}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60">{tenant.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(isProv || isFailed) && (
              <Button asChild variant="outline">
                <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                  <Activity className="h-4 w-4" />
                  {isProv ? 'Suivre le déploiement' : "Voir l'erreur"}
                </Link>
              </Button>
            )}
            {isActive && (
              <>
                <Button asChild variant="outline">
                  <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                    <Activity className="h-4 w-4" />
                    Logs
                  </Link>
                </Button>
                <Button asChild className="glow-primary">
                  <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir Frappe CRM
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>

        {isProv && (
          <div className="mt-5 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Provisioning en cours — accédez aux logs détaillés.
          </div>
        )}

        {isFailed && (
          <div className="mt-5 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <Activity className="h-3.5 w-3.5" />
            Le déploiement a échoué — consultez les logs pour le détail.
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="border-t border-border/60 bg-secondary/30 px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>Plan <span className="text-foreground">{planLabel}</span></span>
          <span aria-hidden>·</span>
          <span>Région <span className="text-foreground uppercase">{tenant.region}</span></span>
          <span aria-hidden>·</span>
          <span>Créé le <span className="text-foreground">{new Date(tenant.createdAt).toLocaleDateString('fr-FR')}</span></span>
        </div>
      </div>
    </Card>
  );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
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
        </div>
      </div>
      <div className="flex items-center gap-2">
        {tenant.status === 'provisioning' && (
          <Button asChild size="sm" variant="outline">
            <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
              <Activity className="h-3.5 w-3.5" />
              Suivre
            </Link>
          </Button>
        )}
        {tenant.status === 'active' && (
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
