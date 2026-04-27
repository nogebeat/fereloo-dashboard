import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  XCircle,
  Terminal,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/use-auth';
import { getTenant, streamProvisioningLogs } from '@/lib/api';
import type { ProvisioningLog, TenantStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/tenants/$tenantId')({
  head: () => ({
    meta: [{ title: 'Monitoring tenant — Fereloo' }],
  }),
  component: TenantMonitorPage,
});

function TenantMonitorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { tenantId } = Route.useParams();

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
      <MonitorView tenantId={tenantId} />
    </AppShell>
  );
}

function MonitorView({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => getTenant(tenantId),
  });

  const [logs, setLogs] = useState<ProvisioningLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('Initialisation...');
  const [liveStatus, setLiveStatus] = useState<TenantStatus | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Start log stream when tenant is in provisioning state
  useEffect(() => {
    if (!tenant || tenant.status !== 'provisioning') return;
    setLiveStatus('provisioning');
    const unsub = streamProvisioningLogs(tenant.id, {
      onLog: (log) => setLogs((prev) => [...prev, log]),
      onProgress: (p, step) => {
        setProgress(p);
        setCurrentStep(step);
      },
      onDone: (status) => {
        setLiveStatus(status);
        queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
      },
    });
    return unsub;
  }, [tenant, tenantId, queryClient]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <Card className="border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Tenant introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette instance n'existe pas ou a été supprimée.
        </p>
        <Button className="mt-4" onClick={() => router.navigate({ to: '/dashboard' })}>
          Retour
        </Button>
      </Card>
    );
  }

  const effectiveStatus: TenantStatus = liveStatus ?? tenant.status;
  const isReady = effectiveStatus === 'active';
  const isFailed = effectiveStatus === 'failed';
  const isProvisioning = effectiveStatus === 'provisioning';

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: '/dashboard' })}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux tenants
        </Button>
        <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{tenant.subdomain}</h1>
              <StatusBadge status={effectiveStatus} />
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {tenant.id} · {tenant.region} · plan {tenant.plan}
            </p>
          </div>
          {isReady && (
            <Button asChild className="glow-primary">
              <a href={tenant.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Accéder à l'instance
              </a>
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
          <span className="font-mono text-xs text-muted-foreground">
            {isReady ? 100 : progress}%
          </span>
        </div>
        <Progress value={isReady ? 100 : progress} className="mt-3 h-2" />
        <p className="mt-3 truncate font-mono text-xs text-muted-foreground">
          {isReady ? 'Instance opérationnelle.' : currentStep}
        </p>
      </Card>

      <Card className="overflow-hidden border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Logs de provisionnement</span>
            {isProvisioning && (
              <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {logs.length} entrées
          </span>
        </div>
        <div
          ref={consoleRef}
          className="max-h-[420px] overflow-auto bg-background/60 p-4 font-mono text-xs leading-relaxed"
        >
          {logs.length === 0 ? (
            <p className="text-muted-foreground">En attente du flux de logs...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <LogLine key={log.id} log={log} />
              ))}
              {isProvisioning && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-primary">▌</span>
                  <span className="animate-pulse">streaming...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function LogLine({ log }: { log: ProvisioningLog }) {
  const time = new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour12: false });
  const colorMap = {
    info: 'text-foreground/80',
    success: 'text-success',
    error: 'text-destructive',
    warn: 'text-warning',
  } as const;
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 text-muted-foreground">{time}</span>
      <span className={cn('break-all', colorMap[log.level])}>{log.message}</span>
    </div>
  );
}
