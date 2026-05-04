import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { getCurrentTenant, listTenants, deleteTenant } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { AppShell } from '@/components/app-shell';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
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
        <div className="h-5 w-5 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  const isLoading = loadingCurrent || loadingList;

  return (
    <AppShell>
      {/* Greeting */}
      <div className="mb-12">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Session active
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tighter md:text-4xl">
          Tableau de bord. <span className="text-muted-foreground/40">{user.name.split(' ')[0]}</span>
        </h1>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-[2px]" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-[2px]" />
      <Skeleton className="h-32 w-full rounded-[2px]" />
    </div>
  );
}

function NoTenantState() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 py-12">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[4px] border border-border bg-secondary text-foreground">
          <Rocket className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-none border border-border bg-secondary/50 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Bienvenue sur Fereloo
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-tighter">
          Prêt à démarrer ?
        </h2>
        <p className="mt-4 text-balance text-sm leading-relaxed text-muted-foreground font-medium">
          Vous n'avez pas encore d'instance active. Déployez votre environnement de gestion en moins de 3 minutes.
        </p>
      </div>

      {/* Infrastructure overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Database, label: 'Base de données', desc: 'Isolée' },
          { icon: Server, label: 'Serveur Cache', desc: 'Dédié' },
          { icon: Globe, label: 'Certificat SSL', desc: 'Sécurisé' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-[2px] border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-secondary text-foreground">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-tight">{label}</div>
              <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-foreground/10 bg-card p-8 rounded-[4px] flex flex-col items-center justify-center gap-6 text-center">
        <div>
          <h3 className="font-display text-lg font-bold">Lancer le déploiement</h3>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Choisissez votre nom de domaine et lancez l'installation automatique.
          </p>
        </div>
        <Button asChild className="h-12 px-8 rounded-[2px] font-bold text-xs uppercase tracking-widest">
          <Link to="/provision">
            Démarrer maintenant <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2px] border border-border bg-card p-5 group hover:bg-secondary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 group-hover:text-foreground transition-colors">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tighter">
            {value}
          </p>
          <p className="mt-2 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest truncate">{sub}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-secondary text-foreground/40 group-hover:text-foreground transition-colors">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
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
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Vue d'ensemble
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 px-4 rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border hover:border-foreground">
          <Link to="/provision">
            <Plus className="h-3.5 w-3.5 mr-2" />
            Nouvelle instance
          </Link>
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Layers}
          label="Instances"
          value={String(all.length)}
          sub={`${activeCount} active${activeCount > 1 ? 's' : ''}`}
        />
        <StatTile
          icon={Users}
          label="Plan"
          value={planObj.name}
          sub={`${planObj.users} utilisateurs`}
        />
        <StatTile
          icon={MapPin}
          label="Région"
          value={current.region.toUpperCase()}
          sub="Afrique de l'Ouest"
        />
        <StatTile
          icon={HardDrive}
          label="Stockage"
          value={`${planObj.storageGb} Go`}
          sub="Quota système"
        />
      </div>

      <CurrentTenantCard tenant={current} planLabel={planObj.name} />

      {others.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Autres instances</h2>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {others.length} instance{others.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="border border-border divide-y divide-border rounded-[2px] overflow-hidden">
            {others.map((t) => (
              <TenantRow key={t.id} tenant={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CurrentTenantCard({ tenant, planLabel }: { tenant: Tenant; planLabel: string }) {
  const isActive = tenant.status === 'active';
  const isProv = tenant.status === 'provisioning';
  const isFailed = tenant.status === 'failed';
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['current-tenant'] });
    },
    onSettled: () => setIsDeleting(false),
  });

  const handleDelete = () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette instance ? Toutes les données seront perdues.")) {
      setIsDeleting(true);
      deleteMutation.mutate(tenant.id);
    }
  };

  return (
    <div className="mt-12 border border-border bg-card rounded-[2px] overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] border border-border bg-secondary font-display text-xl font-bold uppercase text-foreground">
              {tenant.subdomain.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tighter">{tenant.subdomain}</h2>
                <StatusBadge status={tenant.status} />
              </div>
              <p className="mt-2 font-mono text-xs font-bold text-muted-foreground/60 tracking-tight">
                {tenant.url.replace('https://', '')}
              </p>
              <p className="mt-1 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest truncate max-w-xs">
                Identifiant : {tenant.id}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-9 w-9 p-0 rounded-[2px] border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
              title="Supprimer l'instance"
            >
              {isDeleting ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>

            {(isProv || isFailed) && (
              <Button asChild variant="outline" size="sm" className="h-9 px-5 rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border">
                <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                  <Activity className="h-3.5 w-3.5 mr-2" />
                  {isProv ? 'Suivre l\'installation' : "Détails erreur"}
                </Link>
              </Button>
            )}
            {isActive && (
              <>
                <Button asChild variant="outline" size="sm" className="h-9 px-5 rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border">
                  <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
                    <Activity className="h-3.5 w-3.5 mr-2" />
                    Statistiques
                  </Link>
                </Button>
                <Button asChild size="sm" className="h-9 px-6 rounded-[2px] font-bold text-[10px] uppercase tracking-widest">
                  <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Ouvrir le CRM
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>

        {isProv && (
          <div className="mt-8 flex items-center gap-4 rounded-[2px] border border-border bg-secondary/50 px-6 py-4 text-xs font-bold uppercase tracking-widest text-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Installation en cours. Suivez l'avancement en temps réel.
          </div>
        )}

        {isFailed && (
          <div className="mt-8 flex items-center gap-4 rounded-[2px] border border-destructive/20 bg-destructive/5 px-6 py-4 text-xs font-bold uppercase tracking-widest text-destructive">
            <Activity className="h-4 w-4" />
            Échec du déploiement. Veuillez consulter les logs pour plus de détails.
          </div>
        )}
      </div>

      {/* Metadata footer */}
      <div className="border-t border-border bg-secondary/20 px-8 py-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span>
            PLAN : <span className="text-foreground">{planLabel}</span>
          </span>
          <span>
            RÉGION : <span className="text-foreground">{tenant.region.toUpperCase()}</span>
          </span>
          <span>
            DISPONIBILITÉ : <span className="text-success">99.9%</span>
          </span>
          <span className="ml-auto">
            CRÉÉ LE : <span className="text-foreground">{new Date(tenant.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['current-tenant'] });
    },
    onSettled: () => setIsDeleting(false),
  });

  const handleDelete = () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette instance ?")) {
      setIsDeleting(true);
      deleteMutation.mutate(tenant.id);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-border bg-secondary font-mono text-[10px] font-bold uppercase text-muted-foreground/60">
        {tenant.subdomain.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="truncate text-sm font-bold uppercase tracking-tight">{tenant.subdomain}</span>
          <StatusBadge status={tenant.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-tight text-muted-foreground/40">
          <span className="truncate tracking-widest">{tenant.url.replace('https://', '')}</span>
          <span className="text-border">/</span>
          <span>{tenant.plan.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0 rounded-[2px] border-border hover:bg-destructive/5 hover:text-destructive"
        >
          {isDeleting ? <Activity className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 px-4 rounded-[2px] font-bold text-[9px] uppercase tracking-widest border-border">
          <Link to="/status/$tenantId" params={{ tenantId: tenant.id }}>
            Logs
          </Link>
        </Button>
        {tenant.status === 'active' && (
          <Button asChild size="sm" variant="outline" className="h-8 px-4 rounded-[2px] font-bold text-[9px] uppercase tracking-widest border-border hover:bg-foreground hover:text-background">
            <a href={tenant.url} target="_blank" rel="noopener noreferrer">
              Accès
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
