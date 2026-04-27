import { createFileRoute, useNavigate, useRouter, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Loader2, Rocket, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/use-auth';
import { checkSubdomainAvailable, provisionTenant } from '@/lib/api';
import { PLANS, type PlanId } from '@/lib/types';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/provision')({
  head: () => ({
    meta: [
      { title: 'Provisionner une instance — Fereloo' },
      {
        name: 'description',
        content:
          'Lancez le provisioning d\'une instance Frappe CRM dédiée : sous-domaine, plan, déploiement automatique.',
      },
    ],
  }),
  component: ProvisionPage,
});

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

type SubdomainCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function ProvisionPage() {
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
      <ProvisionForm />
    </AppShell>
  );
}

function ProvisionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subdomain, setSubdomain] = useState('');
  const [plan, setPlan] = useState<PlanId>('pro');
  const [check, setCheck] = useState<SubdomainCheck>('idle');

  useEffect(() => {
    if (!subdomain) {
      setCheck('idle');
      return;
    }
    if (!SUBDOMAIN_REGEX.test(subdomain)) {
      setCheck('invalid');
      return;
    }
    setCheck('checking');
    const t = setTimeout(async () => {
      const ok = await checkSubdomainAvailable(subdomain);
      setCheck(ok ? 'available' : 'taken');
    }, 400);
    return () => clearTimeout(t);
  }, [subdomain]);

  const provision = useMutation({
    mutationFn: () => provisionTenant({ subdomain, plan }),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['current-tenant'] });
      navigate({ to: '/status/$tenantId', params: { tenantId: tenant.id } });
    },
  });

  const canSubmit = check === 'available' && !provision.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Nouvelle instance Frappe CRM
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez un sous-domaine et un plan. Le déploiement démarre immédiatement.
        </p>
      </div>

      <Card className="space-y-6 border-border bg-card p-6">
        <div className="space-y-3">
          <Label htmlFor="subdomain" className="font-mono text-[11px] uppercase tracking-wider">
            Sous-domaine
          </Label>
          <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-background">
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              placeholder="ma-boutique"
              maxLength={30}
              className="h-11 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
              autoFocus
              disabled={provision.isPending}
            />
            <div className="flex items-center border-l border-border bg-secondary px-3 font-mono text-sm text-muted-foreground">
              .fereloo.com
            </div>
          </div>
          <SubdomainStatus state={check} />
          <p className="font-mono text-[11px] text-muted-foreground">
            Lettres minuscules, chiffres, tirets. Doit commencer et finir par un caractère
            alphanumérique. 3 à 30 caractères.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="font-mono text-[11px] uppercase tracking-wider">Plan</Label>
          <div className="grid gap-3 md:grid-cols-3">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  disabled={provision.isPending}
                  className={cn(
                    'group relative flex flex-col rounded-lg border bg-card p-4 text-left transition-all',
                    selected
                      ? 'border-primary glow-primary'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  {p.highlighted && (
                    <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                      <Sparkles className="h-2.5 w-2.5" />
                      Populaire
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.name}</span>
                    {selected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xl font-semibold">
                      {p.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-muted-foreground">FCFA{p.period}</span>
                  </div>
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {p.users} users · {p.storageGb} Go
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {provision.isError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Échec du provisioning. Réessayez.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => provision.mutate()}
            disabled={!canSubmit}
            className="glow-primary"
          >
            {provision.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Démarrage...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Lancer le déploiement
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SubdomainStatus({ state }: { state: SubdomainCheck }) {
  if (state === 'idle') return null;
  const map: Record<Exclude<SubdomainCheck, 'idle'>, { msg: string; cls: string }> = {
    checking: { msg: 'Vérification de la disponibilité...', cls: 'text-muted-foreground' },
    available: { msg: '✓ Sous-domaine disponible', cls: 'text-success' },
    taken: { msg: '✕ Sous-domaine déjà pris', cls: 'text-destructive' },
    invalid: {
      msg: 'Format invalide : 3-30 caractères, [a-z0-9-] uniquement, sans tiret en début/fin.',
      cls: 'text-destructive',
    },
  };
  const { msg, cls } = map[state];
  return <p className={cn('font-mono text-xs', cls)}>{msg}</p>;
}
