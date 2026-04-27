import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Zap, ArrowRight, Shield, Gauge, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LandingPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Email invalide');
      return;
    }
    signIn(trimmed);
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Fereloo</span>
        </div>
        <a
          href="#get-started"
          className="rounded-md border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Get started
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-12 text-center md:px-6 md:pt-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Frappe CRM · Provisioning-as-a-Service
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          Votre CRM africain,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            prêt en 90 secondes.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          Fereloo provisionne automatiquement des instances <strong>Frappe CRM</strong> dédiées
          pour les entreprises africaines : MariaDB, Redis, sous-domaine TLS — sans DevOps,
          facturé en FCFA.
        </p>

        <form
          id="get-started"
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="vous@votre-entreprise.africa"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="h-11 bg-card/70 backdrop-blur"
          />
          <Button type="submit" size="lg" className="h-11 glow-primary">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-3 font-mono text-[11px] uppercase text-muted-foreground">
          Démo — auth simulée, aucune carte requise
        </p>
      </section>

      {/* Pricing — 3 plans */}
      <section
        id="pricing"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Tarifs simples, en FCFA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez le plan adapté à la taille de votre équipe.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card/70 p-6 backdrop-blur transition',
                p.highlighted
                  ? 'border-primary glow-primary'
                  : 'border-border hover:border-primary/40',
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  Plus populaire
                </span>
              )}
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">
                  {p.priceFcfa.toLocaleString('fr-FR')}
                </span>
                <span className="text-sm text-muted-foreground">FCFA{p.period}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-primary">
                {p.users} utilisateurs · {p.storageGb} Go
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.highlighted ? 'default' : 'outline'}
                className={cn('mt-6', p.highlighted && 'glow-primary')}
              >
                <a href="#get-started">Get started</a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto grid max-w-5xl gap-4 px-4 pb-20 md:grid-cols-3 md:px-6">
        {[
          {
            icon: Gauge,
            title: 'Provisioning instantané',
            desc: 'Pipeline orchestré : MariaDB, Redis, Frappe CRM, TLS — visible en temps réel.',
          },
          {
            icon: Sparkles,
            title: 'Pensé pour l\'Afrique',
            desc: 'Facturation FCFA, intégrations Wave/MoMo/SMS, latence optimisée Afrique de l\'Ouest.',
          },
          {
            icon: Shield,
            title: 'Sécurité opérationnelle',
            desc: 'Backups automatiques, rotation des secrets, audit logs centralisés.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition hover:border-primary/40"
          >
            <f.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
