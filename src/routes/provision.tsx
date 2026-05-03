import { createFileRoute, useNavigate, useRouter, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Loader2,
  Rocket,
  Sparkles,
  Globe,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
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
        content: "Lancez le provisioning d'une instance Frappe CRM dédiée : sous-domaine, plan, déploiement automatique.",
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
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    mutationFn: () => provisionTenant({ subdomain, plan, adminPassword }),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['current-tenant'] });
      navigate({ to: '/status/$tenantId', params: { tenantId: tenant.id } });
    },
  });

  const canSubmit = check === 'available' && adminPassword.length >= 8 && !provision.isPending;
  const selectedPlan = PLANS.find((p) => p.id === plan)!;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Nouvelle instance Frappe CRM
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choisissez un sous-domaine et un plan. Le déploiement démarre immédiatement.
        </p>
      </div>

      <div className="space-y-6">

        {/* ── Subdomain ── */}
        <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Sous-domaine</h2>
              <p className="font-mono text-[10px] text-muted-foreground">Adresse de votre instance</p>
            </div>
          </div>

          <Label htmlFor="subdomain" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Sous-domaine
          </Label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
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
            <div className="flex items-center border-l border-border bg-secondary/60 px-3 font-mono text-sm text-muted-foreground shrink-0">
              .fereloo.com
            </div>
          </div>

          {/* Status message */}
          <SubdomainStatus state={check} />

          {/* Live URL preview */}
          {subdomain && check !== 'invalid' && (
            <div className="flex items-center gap-2 rounded-md bg-secondary/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <span>
                https://
                <span className={cn(
                  check === 'available' ? 'text-success' : check === 'taken' ? 'text-destructive' : 'text-foreground'
                )}>
                  {subdomain || 'votre-nom'}
                </span>
                .fereloo.com
              </span>
            </div>
          )}

          <p className="font-mono text-[11px] text-muted-foreground/70">
            Lettres minuscules, chiffres, tirets uniquement · 3 à 30 caractères
          </p>
        </div>

        {/* ── Password ── */}
        <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary font-mono text-xs font-bold">
              🔑
            </div>
            <div>
              <h2 className="text-sm font-semibold">Mot de passe administrateur</h2>
              <p className="font-mono text-[10px] text-muted-foreground">Compte admin Frappe CRM</p>
            </div>
          </div>

          <Label htmlFor="admin-password" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Mot de passe
          </Label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              className="h-11 pr-10 font-mono"
              disabled={provision.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength indicator */}
          {adminPassword.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[8, 12, 16].map((threshold) => (
                  <div
                    key={threshold}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      adminPassword.length >= threshold ? 'bg-success' : 'bg-border',
                    )}
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                {adminPassword.length < 8
                  ? 'Trop court'
                  : adminPassword.length < 12
                  ? 'Acceptable'
                  : adminPassword.length < 16
                  ? 'Bon'
                  : 'Fort'}
              </p>
            </div>
          )}

          <p className="font-mono text-[11px] text-muted-foreground/70">
            Ce mot de passe sera celui du compte admin de votre instance Frappe CRM.
          </p>
        </div>

        {/* ── Plan selection ── */}
        <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Formule</h2>
              <p className="font-mono text-[10px] text-muted-foreground">Choisissez votre plan</p>
            </div>
          </div>

          <Label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Plan
          </Label>
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
                    'group relative flex flex-col rounded-xl border p-5 text-left transition-all',
                    selected
                      ? 'border-primary bg-primary/5 glow-primary'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-card/80',
                  )}
                >
                  {p.highlighted && (
                    <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground shadow-sm shadow-primary/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      Populaire
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <div className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border transition-all',
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                    )}>
                      {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-2xl font-bold">
                      {p.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-muted-foreground">FCFA{p.period}</span>
                  </div>

                  <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {p.users} utilisateurs · {p.storageGb} Go
                  </div>

                  <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {provision.isError && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Échec du provisioning</p>
              <p className="mt-0.5 text-destructive/80">
                {provision.error instanceof Error ? provision.error.message : 'Réessayez dans quelques instants.'}
              </p>
            </div>
          </div>
        )}

        {/* Summary + submit */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {check === 'available' && adminPassword.length >= 8 ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Prêt à déployer{' '}
                  <span className="font-mono font-medium">{subdomain}.fereloo.com</span>
                  {' '}— {selectedPlan.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Remplissez les champs ci-dessus pour continuer</span>
              </div>
            )}
          </div>
          <Button
            onClick={() => provision.mutate()}
            disabled={!canSubmit}
            className="glow-primary shrink-0"
          >
            {provision.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Démarrage en cours…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Lancer le déploiement
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}

function SubdomainStatus({ state }: { state: SubdomainCheck }) {
  if (state === 'idle') return null;

  const config: Record<Exclude<SubdomainCheck, 'idle'>, { msg: string; icon: React.ReactNode; cls: string }> = {
    checking: {
      msg: 'Vérification de la disponibilité…',
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      cls: 'text-muted-foreground',
    },
    available: {
      msg: 'Sous-domaine disponible',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      cls: 'text-success',
    },
    taken: {
      msg: 'Sous-domaine déjà pris',
      icon: <XCircle className="h-3.5 w-3.5" />,
      cls: 'text-destructive',
    },
    invalid: {
      msg: 'Format invalide — 3-30 caractères, [a-z0-9-] uniquement, sans tiret en début/fin',
      icon: <XCircle className="h-3.5 w-3.5" />,
      cls: 'text-destructive',
    },
  };

  const { msg, icon, cls } = config[state];
  return (
    <p className={cn('flex items-center gap-1.5 font-mono text-xs', cls)}>
      {icon}
      {msg}
    </p>
  );
}
