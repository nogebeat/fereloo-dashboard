import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  XCircle,
  Terminal,
  Database,
  Server,
  Box,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/use-auth';
import { getTenantStatus } from '@/lib/api';
import type {
  ProvisioningLog,
  ProvisioningStep,
  ProvisioningStepKey,
} from '@/lib/types';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/status/$tenantId')({
  head: () => ({
    meta: [
      { title: 'Statut du déploiement — Fereloo' },
      {
        name: 'description',
        content: 'Suivi en temps réel du provisioning de votre instance Frappe CRM.',
      },
    ],
  }),
  component: StatusPage,
});

const STEP_ICONS: Record<ProvisioningStepKey, React.ComponentType<{ className?: string }>> = {
  mariadb: Database,
  redis: Server,
  app: Box,
  domain: Globe,
};

function StatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: '/' });
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <StatusView />
    </AppShell>
  );
}

function StatusView() {
  const { tenantId } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenant-status', tenantId],
    queryFn: () => getTenantStatus(tenantId),
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d) return 3000;
      if (d.tenant.status === 'provisioning') return 3000;
      return false; // stop polling once final
    },
    refetchIntervalInBackground: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Tenant introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette instance n'existe pas ou a été supprimée.
        </p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Retour</Link>
        </Button>
      </Card>
    );
  }

  const { tenant, progress, steps, logs, errorMessage } = data;
  const isReady = tenant.status === 'active';
  const isFailed = tenant.status === 'failed';
  const isProvisioning = tenant.status === 'provisioning';

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
        <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{tenant.subdomain}</h1>
              <StatusBadge status={tenant.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {tenant.id} · {tenant.region} · plan {tenant.plan}
            </p>
          </div>
          {isReady && (
            <Button asChild className="glow-primary">
              <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Ouvrir Frappe CRM
              </a>
            </Button>
          )}
          {isFailed && (
            <Button asChild variant="outline">
              <Link to="/provision">
                <RefreshCw className="h-4 w-4" />
                Relancer un provisioning
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isProvisioning && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {isReady && <CheckCircle2 className="h-4 w-4 text-success" />}
            {isFailed && <XCircle className="h-4 w-4 text-destructive" />}
            <span className="text-sm font-medium">
              {isReady
                ? 'Déploiement terminé'
                : isFailed
                  ? 'Échec du déploiement'
                  : 'Déploiement en cours'}
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        {errorMessage && (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            {errorMessage}
          </p>
        )}
      </Card>

      <StepsCard steps={steps} />

      <LogsConsole logs={logs} live={isProvisioning} />
    </div>
  );
}

function StepsCard({ steps }: { steps: ProvisioningStep[] }) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-medium">Étapes de provisioning</h2>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[step.key];
          return (
            <li key={step.key} className="flex items-center gap-4 px-5 py-4">
              <div
                className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border',
                  step.status === 'success' &&
                    'border-success/40 bg-success/10 text-success',
                  step.status === 'running' &&
                    'border-primary/40 bg-primary/10 text-primary',
                  step.status === 'failed' &&
                    'border-destructive/40 bg-destructive/10 text-destructive',
                  step.status === 'pending' && 'border-border bg-secondary text-muted-foreground',
                )}
              >
                {step.status === 'running' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.status === 'failed' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {i + 1}. {step.label}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-wider',
                      step.status === 'success' && 'text-success',
                      step.status === 'running' && 'text-primary',
                      step.status === 'failed' && 'text-destructive',
                      step.status === 'pending' && 'text-muted-foreground',
                    )}
                  >
                    {step.status}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function LogsConsole({ logs, live }: { logs: ProvisioningLog[]; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);
  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Logs</span>
          {live && (
            <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          )}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {logs.length} entrées · poll 3s
        </span>
      </div>
      <div
        ref={ref}
        className="max-h-[420px] overflow-auto bg-background/60 p-4 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <p className="text-muted-foreground">En attente du flux de logs...</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              const time = new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour12: false });
              const colorMap = {
                info: 'text-foreground/80',
                success: 'text-success',
                error: 'text-destructive',
                warn: 'text-warning',
              } as const;
              return (
                <div key={log.id} className="flex gap-3">
                  <span className="flex-shrink-0 text-muted-foreground">{time}</span>
                  <span className={cn('break-all', colorMap[log.level])}>{log.message}</span>
                </div>
              );
            })}
            {live && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">▌</span>
                <span className="animate-pulse">streaming...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
