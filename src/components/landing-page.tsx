import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Zap, ArrowRight, Shield, Gauge, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/use-auth';

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
          href="#login"
          className="rounded-md border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Console
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-12 text-center md:px-6 md:pt-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Provisioning-as-a-Service
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          Déployez un tenant
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            en moins de 90 secondes.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          Fereloo provisionne automatiquement vos instances applicatives multi-tenant : MariaDB,
          stockage, sous-domaines TLS, monitoring — sans intervention DevOps.
        </p>

        <form
          id="login"
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="ops@votre-entreprise.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="h-11 bg-card/70 backdrop-blur"
          />
          <Button type="submit" size="lg" className="h-11 glow-primary">
            Accéder à la console
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-3 font-mono text-[11px] uppercase text-muted-foreground">
          Démo — aucune authentification réelle requise
        </p>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-4 px-4 pb-20 md:grid-cols-3 md:px-6">
        {[
          {
            icon: Gauge,
            title: 'Provisioning instantané',
            desc: 'Pipeline orchestré : DNS, base de données, TLS, ingress — visible en temps réel.',
          },
          {
            icon: Layers,
            title: 'Multi-tenant natif',
            desc: 'Isolation stricte par namespace. Chaque client a sa propre base et son sous-domaine.',
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
