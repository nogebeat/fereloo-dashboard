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
  Users,
  HardDrive,
  MapPin,
  Layers,
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
        content: 'Vos instances Frappe CRM provisionnées sur Fereloo : statut, plan et accès direct.',
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
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Bonjour, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function NoTenantState() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
          <Rocket className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Bienvenue sur Fereloo
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Provisionnez votre instance Frappe CRM
        </h2>
        <p className="mt-3 text-balance text-sm leading-relaxed text-muted-foreground">
          Vous n'avez pas encore d'instance. Choisissez un plan et un sous-domaine — votre CRM
          sera prêt en 90 secondes.
        </p>
      </div>

      {/* Infrastructure overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Database, label: 'MariaDB', desc: 'Base de données dédiée' },
          { icon: Server, label: 'Redis', desc: 'Cache & file de jobs' },
          { icon: Globe, label: 'TLS auto', desc: 'Certificat Let\'s Encrypt' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{label}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-primary/25 bg-card p-6 glow-primary">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-base font-bold">Lancer le provisioning</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sous-domaine, plan, déploiement automatisé en quelques clics.
            </p>
          </div>
          <Button asChild className="glow-primary shrink-0">
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

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent?: 'primary' | 'success' | 'warning' | 'muted';
}) {
  const accentColors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    muted: 'bg-muted-foreground',
  };
  const iconColors = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    muted: 'bg-secondary text-muted-foreground',
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card px-4 py-4">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${accentColors[accent]}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-extrabold leading-none tracking-tight">
            {value}
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/70 truncate">{sub}</p>
        </div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconColors[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function TenantOverview({ current, all }: { current: Tenant; all: Tenant[] }) {
  const planObj = PLANS.find((p) => p.id === current.plan) ?? PLANS[0];
  const others = all.filter((t) => t.id !== current.id);
  const activeCount = all.filter((t) => t.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de vos instances</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/provision">
            <Plus className="h-3.5 w-3.5" />
            Nouvelle instance
          </Link>
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={Layers}
          label="Instances"
          value={String(all.length)}
          sub={`${activeCount} active${activeCount > 1 ? 's' : ''}`}
          accent="primary"
        />
        <StatTile
          icon={Users}
          label="Plan actif"
          value={planObj.name}
          sub={`${planObj.users} utilisateurs`}
          accent="success"
        />
        <StatTile
          icon={MapPin}
          label="Région"
          value={current.region.toUpperCase()}
          sub="Hébergé en Afrique"
          accent="warning"
        />
        <StatTile
          icon={HardDrive}
          label="Stockage"
          value={`${planObj.storageGb} Go`}
          sub="Inclus dans le plan"
          accent="muted"
        />
      </div>

      <CurrentTenantCard tenant={current} planLabel={planObj.name} />

      {others.length > 0 && (
        <Card className="overflow-hidden border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Autres instances</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {others.length} instance{others.length > 1 ? 's' : ''}
            </span>
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

  const statusBorderColor = {
    active: 'from-success/60 via-success/40 to-success/10',
    provisioning: 'from-primary/60 via-primary/40 to-primary/10',
    failed: 'from-destructive/60 via-destructive/40 to-destructive/10',
    suspended: 'from-warning/60 via-warning/40 to-warning/10',
  }[tenant.status];

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Status-colored gradient top line */}
      <div className={`h-px bg-gradient-to-r ${statusBorderColor}`} />

      <div className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-display text-lg font-extrabold uppercase text-primary">
              {tenant.subdomain.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold tracking-tight">{tenant.subdomain}</h2>
                <StatusBadge status={tenant.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {tenant.url.replace('https://', '')}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/50 truncate max-w-xs">
                {tenant.id}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(isProv || isFailed) && (
              <Button asChild variant="outline" size="sm">
                <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                  <Activity className="h-3.5 w-3.5" />
                  {isProv ? 'Suivre le déploiement' : "Voir l'erreur"}
                </Link>
              </Button>
            )}
            {isActive && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                    <Activity className="h-3.5 w-3.5" />
                    Logs
                  </Link>
                </Button>
                <Button asChild size="sm" className="glow-primary">
                  <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ouvrir Frappe CRM
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>

        {isProv && (
          <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            Provisioning en cours — accédez aux logs pour suivre en temps réel.
          </div>
        )}

        {isFailed && (
          <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <Activity className="h-4 w-4 shrink-0" />
            Le déploiement a échoué — consultez les logs pour le détail.
          </div>
        )}
      </div>

      {/* Metadata footer */}
      <div className="border-t border-border/50 bg-secondary/20 px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>
            Plan <span className="text-foreground font-medium">{planLabel}</span>
          </span>
          <span className="text-border" aria-hidden>·</span>
          <span>
            Région <span className="text-foreground font-medium uppercase">{tenant.region}</span>
          </span>
          <span className="text-border" aria-hidden>·</span>
          <span>
            Créé le{' '}
            <span className="text-foreground font-medium">
              {new Date(tenant.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-accent/30 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary font-mono text-xs font-bold uppercase text-muted-foreground">
        {tenant.subdomain.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{tenant.subdomain}</span>
          <StatusBadge status={tenant.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">{tenant.url.replace('https://', '')}</span>
          <span className="text-border">·</span>
          <span className="uppercase">{tenant.plan}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
