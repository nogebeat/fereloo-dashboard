import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Loader2, Rocket, Sparkles, Globe } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/use-auth';
import { checkSubdomainAvailable, createTenant } from '@/lib/api';
import { PLANS } from '@/lib/types';
import type { PlanId } from '@/lib/types';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/tenants/new')({
  head: () => ({
    meta: [{ title: 'Nouveau tenant — Fereloo' }],
  }),
  component: NewTenantPage,
});

const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,30}$/;

function NewTenantPage() {
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
      <Wizard />
    </AppShell>
  );
}

type SubdomainCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function Wizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subdomain, setSubdomain] = useState('');
  const [plan, setPlan] = useState<PlanId>('pro');
  const [check, setCheck] = useState<SubdomainCheck>('idle');

  // Debounced availability check
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

  const createMutation = useMutation({
    mutationFn: () => createTenant({ subdomain, plan }),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate({ to: '/tenants/$tenantId', params: { tenantId: tenant.id } });
    },
  });

  const canGoStep2 = check === 'available';
  const canGoStep3 = !!plan;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux tenants
        </Button>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Créer un nouveau tenant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trois étapes : sous-domaine, plan, puis déploiement.
        </p>
      </div>

      <Stepper current={step} />

      {step === 1 && (
        <StepCard title="Étape 1 — Sous-domaine" subtitle="Choisissez l'identifiant public de votre instance.">
          <div className="space-y-3">
            <Label htmlFor="subdomain" className="font-mono text-[11px] uppercase tracking-wider">
              Sous-domaine
            </Label>
            <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-card">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                placeholder="mon-client"
                maxLength={30}
                className="h-11 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                autoFocus
              />
              <div className="flex items-center border-l border-border bg-secondary px-3 font-mono text-sm text-muted-foreground">
                .fereloo.com
              </div>
            </div>
            <SubdomainStatus state={check} />
            <p className="font-mono text-[11px] text-muted-foreground">
              Lettres minuscules, chiffres, tirets. 3 à 30 caractères.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canGoStep2}>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Étape 2 — Plan" subtitle="Sélectionnez le plan adapté à la charge prévue.">
          <div className="grid gap-3 md:grid-cols-3">
            {PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
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
                    <span className="text-2xl font-semibold">
                      {p.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-muted-foreground">FCFA{p.period}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canGoStep3}>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="Étape 3 — Récapitulatif" subtitle="Vérifiez puis lancez le déploiement.">
          <Summary subdomain={subdomain} plan={plan} />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)} disabled={createMutation.isPending}>
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="glow-primary"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Lancer le déploiement
                </>
              )}
            </Button>
          </div>
        </StepCard>
      )}
    </div>
  );
}

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Sous-domaine' },
    { n: 2, label: 'Plan' },
    { n: 3, label: 'Déploiement' },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-primary/10 text-primary',
                !done && !active && 'border-border bg-secondary text-muted-foreground',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.n}
            </div>
            <span
              className={cn(
                'hidden text-xs sm:inline',
                active ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-6 border-border bg-card p-6">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

function SubdomainStatus({ state }: { state: SubdomainCheck }) {
  if (state === 'idle') return null;
  const map: Record<Exclude<SubdomainCheck, 'idle'>, { msg: string; cls: string }> = {
    checking: { msg: 'Vérification de la disponibilité...', cls: 'text-muted-foreground' },
    available: { msg: '✓ Sous-domaine disponible', cls: 'text-success' },
    taken: { msg: '✕ Sous-domaine déjà pris', cls: 'text-destructive' },
    invalid: {
      msg: 'Format invalide : 3-30 caractères, [a-z0-9-] uniquement',
      cls: 'text-destructive',
    },
  };
  const { msg, cls } = map[state];
  return <p className={cn('font-mono text-xs', cls)}>{msg}</p>;
}

function Summary({ subdomain, plan }: { subdomain: string; plan: PlanId }) {
  const planObj = PLANS.find((p) => p.id === plan)!;
  return (
    <div className="space-y-3 rounded-md border border-border bg-secondary/50 p-4">
      <SummaryRow
        icon={<Globe className="h-4 w-4 text-primary" />}
        label="URL"
        value={`https://${subdomain}.fereloo.com`}
      />
      <SummaryRow
        icon={<Sparkles className="h-4 w-4 text-primary" />}
        label="Plan"
        value={`${planObj.name} — ${planObj.priceFcfa.toLocaleString('fr-FR')} FCFA${planObj.period}`}
      />
      <SummaryRow
        icon={<Rocket className="h-4 w-4 text-primary" />}
        label="Région"
        value="eu-west-1"
      />
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
