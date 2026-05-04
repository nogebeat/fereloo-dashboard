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
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/use-auth';
import { getTenantStatus } from '@/lib/api';
import type {
  ProvisioningLog,
  ProvisioningStep,
  ProvisioningStepKey,
  ProvisioningStepStatus,
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
  booting: Activity,
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
      return false;
    },
    refetchIntervalInBackground: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-border bg-card p-10 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">Instance introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette instance n'existe pas ou a été supprimée.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Retour au tableau de bord</Link>
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
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
        <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-display text-sm font-extrabold uppercase text-primary">
                {tenant.subdomain.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-2xl font-bold tracking-tight">{tenant.subdomain}</h1>
                  <StatusBadge status={tenant.status} />
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {tenant.id} · {tenant.region} · plan {tenant.plan}
                </p>
              </div>
            </div>
          </div>
          {isReady && (
            <Button asChild className="glow-primary shrink-0">
              <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Ouvrir Frappe CRM
              </a>
            </Button>
          )}
          {isFailed && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/provision">
                <RefreshCw className="h-4 w-4" />
                Relancer un provisioning
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Progress card */}
      <Card className="border-border bg-card overflow-hidden">
        <div
          className={cn(
            'h-px',
            isReady
              ? 'bg-gradient-to-r from-success/40 via-success to-success/40'
              : isFailed
              ? 'bg-gradient-to-r from-destructive/40 via-destructive to-destructive/40'
              : 'bg-gradient-to-r from-primary/40 via-primary to-primary/40',
          )}
        />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isProvisioning && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {isReady && <CheckCircle2 className="h-4 w-4 text-success" />}
              {isFailed && <XCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm font-medium">
                {isReady
                  ? 'Déploiement terminé avec succès'
                  : isFailed
                  ? 'Échec du déploiement'
                  : 'Déploiement en cours…'}
              </span>
            </div>
            <span className="font-display text-2xl font-bold tabular-nums">
              {progress}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                isReady
                  ? 'bg-success'
                  : isFailed
                  ? 'bg-destructive'
                  : 'progress-gradient',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
      </Card>

      {/* Pipeline visualization */}
      <PipelineView steps={steps} />

      {/* Logs console */}
      <LogsConsole logs={logs} live={isProvisioning} />
    </div>
  );
}

function PipelineView({ steps }: { steps: ProvisioningStep[] }) {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-medium">Pipeline de déploiement</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {steps.filter((s) => s.status === 'success').length}/{steps.length} étapes
        </span>
      </div>

      {/* Pipeline steps — horizontal on md+, vertical on mobile */}
      <div className="p-5">
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex md:items-start md:gap-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center text-center">
                <PipelineStepIcon step={step} />
                <p className="mt-2 text-xs font-semibold">{step.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground max-w-[100px]">
                  {step.description}
                </p>
                <StepStatusLabel status={step.status} />
              </div>
              {i < steps.length - 1 && (
                <div className="mt-4 flex-1 min-w-[24px]">
                  <PipelineConnector fromStatus={step.status} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical list */}
        <ol className="space-y-0 md:hidden">
          {steps.map((step, i) => (
              <li key={step.key} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <PipelineStepIcon step={step} size="sm" />
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'mt-1 w-px flex-1 min-h-[32px]',
                        step.status === 'success' ? 'bg-success/40' : 'bg-border',
                      )}
                    />
                  )}
                </div>
                <div className="pb-6 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{step.label}</span>
                    <StepStatusLabel status={step.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

function PipelineStepIcon({
  step,
  size = 'md',
}: {
  step: ProvisioningStep;
  size?: 'sm' | 'md';
}) {
  const Icon = STEP_ICONS[step.key as ProvisioningStepKey];
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  const iconDim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  const containerClass = cn(
    'flex shrink-0 items-center justify-center rounded-full border-2 transition-all',
    dim,
    step.status === 'success' &&
      'border-success bg-success/15 text-success',
    step.status === 'running' &&
      'border-primary bg-primary/15 text-primary',
    step.status === 'failed' &&
      'border-destructive bg-destructive/15 text-destructive',
    step.status === 'pending' &&
      'border-border bg-secondary text-muted-foreground',
  );

  return (
    <div className={containerClass}>
      {step.status === 'running' ? (
        <Loader2 className={cn(iconDim, 'animate-spin')} />
      ) : step.status === 'success' ? (
        <CheckCircle2 className={iconDim} />
      ) : step.status === 'failed' ? (
        <XCircle className={iconDim} />
      ) : (
        <Icon className={iconDim} />
      )}
    </div>
  );
}

function PipelineConnector({ fromStatus }: { fromStatus: ProvisioningStepStatus }) {
  return (
    <div className="flex items-center justify-center pt-5">
      <div
        className={cn(
          'h-px w-full transition-all',
          fromStatus === 'success' ? 'bg-success/60' : 'bg-border/60',
        )}
      />
    </div>
  );
}

function StepStatusLabel({ status }: { status: ProvisioningStepStatus }) {
  const config: Record<ProvisioningStepStatus, { label: string; cls: string }> = {
    success: { label: 'Terminé', cls: 'text-success' },
    running: { label: 'En cours', cls: 'text-primary' },
    failed: { label: 'Échec', cls: 'text-destructive' },
    pending: { label: 'En attente', cls: 'text-muted-foreground' },
  };
  const { label, cls } = config[status];
  return (
    <span className={cn('mt-1.5 font-mono text-[10px] uppercase tracking-wider', cls)}>
      {label}
    </span>
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
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Logs</span>
          {live && (
            <span className="inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          )}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {logs.length} entrée{logs.length !== 1 ? 's' : ''}{live ? ' · live' : ''}
        </span>
      </div>

      <div
        ref={ref}
        className="max-h-[440px] overflow-auto bg-[oklch(0.12_0_0)] p-4 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <p className="text-muted-foreground/60 italic">En attente du flux de logs…</p>
        ) : (
          <div className="space-y-0.5">
            {logs.map((log) => {
              const time = new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour12: false });
              const colorMap: Record<typeof log.level, string> = {
                info: 'text-foreground/75',
                success: 'text-success',
                error: 'text-destructive',
                warn: 'text-warning',
              };
              const prefixMap: Record<typeof log.level, string> = {
                info: 'text-primary/60',
                success: 'text-success/70',
                error: 'text-destructive/70',
                warn: 'text-warning/70',
              };
              const prefix: Record<typeof log.level, string> = {
                info: 'INFO ',
                success: ' OK  ',
                error: 'ERR  ',
                warn: 'WARN ',
              };
              return (
                <div key={log.id} className="flex gap-3">
                  <span className="shrink-0 text-muted-foreground/40 tabular-nums">{time}</span>
                  <span className={cn('shrink-0', prefixMap[log.level])}>{prefix[log.level]}</span>
                  <span className={cn('break-all', colorMap[log.level])}>{log.message}</span>
                </div>
              );
            })}
            {live && (
              <div className="flex items-center gap-2 pt-1 text-muted-foreground/50">
                <span className="text-primary animate-pulse">▌</span>
                <span className="italic">En attente…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
