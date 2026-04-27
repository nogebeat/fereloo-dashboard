import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  ShieldCheck,
  Smartphone,
  HeartHandshake,
  Store,
  Briefcase,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Vendez plus, sans rien oublier',
    desc: "Chaque prospect, chaque relance, chaque devis au même endroit. Vos commerciaux savent quoi faire, vous savez où en sont vos ventes.",
  },
  {
    icon: Users,
    title: 'Une équipe vraiment alignée',
    desc: "Fini les fichiers Excel éparpillés et les WhatsApp perdus. Toute l'équipe travaille sur la même base client, en temps réel.",
  },
  {
    icon: Clock,
    title: 'Prêt en quelques minutes',
    desc: "Pas d'installation, pas de technicien. Vous créez votre compte et votre espace est prêt à l'emploi pour toute votre équipe.",
  },
  {
    icon: Smartphone,
    title: 'Pensé pour le mobile',
    desc: "Vos commerciaux travaillent depuis leur téléphone, sur le terrain, même avec une connexion limitée.",
  },
  {
    icon: ShieldCheck,
    title: 'Vos données restent les vôtres',
    desc: "Hébergé en Afrique, sauvegardé automatiquement. Vous gardez la main, vous exportez quand vous voulez.",
  },
  {
    icon: HeartHandshake,
    title: 'Une équipe qui parle votre langue',
    desc: "Support en français, équipe basée en Afrique de l'Ouest, qui comprend vos enjeux et vos contraintes.",
  },
];

const USE_CASES = [
  {
    icon: Store,
    sector: 'Commerce & Retail',
    title: 'Fidélisez vos clients réguliers',
    desc: "Suivez les habitudes d'achat, déclenchez des relances ciblées par WhatsApp, mesurez ce qui rapporte vraiment.",
    bullets: [
      'Historique client complet en un coup d\'œil',
      'Campagnes WhatsApp & SMS automatisées',
      'Tableau des ventes par boutique',
    ],
  },
  {
    icon: Briefcase,
    sector: 'Services & Conseil',
    title: 'Pilotez votre pipeline commercial',
    desc: "De la prise de contact au contrat signé : visualisez chaque opportunité, anticipez votre chiffre d'affaires du mois.",
    bullets: [
      'Pipeline visuel par étape de vente',
      'Devis & factures intégrés',
      'Prévisionnel de chiffre d\'affaires',
    ],
  },
  {
    icon: Truck,
    sector: 'Distribution & B2B',
    title: 'Gérez vos commerciaux terrain',
    desc: "Vos équipes prennent les commandes en mobilité, vous suivez les tournées et la performance depuis le bureau.",
    bullets: [
      'Prise de commande mobile hors-ligne',
      'Suivi des visites & tournées',
      'Encaissement Wave & Mobile Money',
    ],
  },
];

const FAQ = [
  {
    q: 'Combien de temps pour démarrer ?',
    a: "Quelques minutes. Vous créez votre compte, vous choisissez le nom de votre espace, et toute votre équipe peut se connecter immédiatement. Pas de matériel à acheter, pas d'installation.",
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: "Oui. Vos données sont hébergées en Afrique, chiffrées, et sauvegardées automatiquement. Vous restez propriétaire de toutes vos informations et pouvez les exporter à tout moment.",
  },
  {
    q: 'Faut-il être technicien pour l\'utiliser ?',
    a: "Non, c'est conçu pour les équipes commerciales et les dirigeants, pas pour des informaticiens. L'interface est en français et la prise en main se fait en moins d'une heure.",
  },
  {
    q: 'Puis-je changer de formule plus tard ?',
    a: "Oui, vous pouvez monter ou descendre de formule à tout moment, sans engagement. La facturation s'ajuste au prorata.",
  },
  {
    q: 'Est-ce compatible avec Wave et Mobile Money ?',
    a: "Oui, à partir de la formule Pro vous bénéficiez des intégrations Wave et Mobile Money pour encaisser vos clients directement depuis vos factures.",
  },
  {
    q: 'Que se passe-t-il si je rencontre un problème ?',
    a: "Notre équipe support est basée en Afrique de l'Ouest et répond en français. La formule Basic inclut le support email, la formule Pro un support prioritaire 6j/7, et la formule Enterprise un accompagnement 24/7.",
  },
];

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
      <div className="absolute inset-0 bg-cyber-grid opacity-20" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            F
          </span>
          <span className="text-lg font-semibold tracking-tight">Fereloo</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#benefices" className="transition hover:text-foreground">Bénéfices</a>
          <a href="#cas-usage" className="transition hover:text-foreground">Cas d'usage</a>
          <a href="#tarifs" className="transition hover:text-foreground">Tarifs</a>
          <a href="#faq" className="transition hover:text-foreground">FAQ</a>
        </nav>
        <a
          href="#commencer"
          className="rounded-md border border-border bg-card/50 px-3 py-1.5 text-sm text-foreground transition hover:border-primary/40"
        >
          Commencer
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-12 text-center md:px-6 md:pt-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Le CRM des PME africaines
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          Plus de clients.
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Moins de chaos.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          Centralisez vos clients, suivez vos ventes et alignez votre équipe commerciale —
          sans Excel, sans technicien, et facturé en FCFA.
        </p>

        <form
          id="commencer"
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
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-3 text-xs text-muted-foreground">
          Essai sans carte bancaire · Configuration en quelques minutes
        </p>
      </section>

      {/* Bénéfices */}
      <section
        id="benefices"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ce que Fereloo change pour votre entreprise
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Concret, mesurable, dès la première semaine.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group rounded-xl border border-border bg-card/60 p-6 backdrop-blur transition hover:border-primary/40"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/20">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cas d'usage */}
      <section
        id="cas-usage"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Adapté à votre métier
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Trois exemples parmi des dizaines de secteurs déjà accompagnés.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="flex flex-col rounded-xl border border-border bg-card/60 p-6 backdrop-blur transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <u.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {u.sector}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{u.desc}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {u.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section
        id="tarifs"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Des tarifs simples, en FCFA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sans engagement. Vous changez de formule quand vous voulez.
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
                  Le plus choisi
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
                <a href="#commencer">Choisir {p.name}</a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="relative z-10 mx-auto max-w-3xl px-4 pb-16 md:px-6 md:pb-24"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Questions fréquentes
          </h2>
        </div>
        <Accordion type="single" collapsible className="rounded-xl border border-border bg-card/60 backdrop-blur">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-border px-5 last:border-b-0"
            >
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-20 md:px-6">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 p-8 text-center backdrop-blur md:p-12">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Prêt à structurer votre commercial ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Rejoignez les PME africaines qui ont arrêté de perdre leurs clients dans Excel.
          </p>
          <Button asChild size="lg" className="mt-6 h-11 glow-primary">
            <a href="#commencer">
              Démarrer gratuitement
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Sans carte bancaire · Sans engagement
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
              F
            </span>
            <span>© {new Date().getFullYear()} Fereloo · Made in Africa</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-foreground">Confidentialité</a>
            <a href="#" className="transition hover:text-foreground">Conditions</a>
            <a href="mailto:hello@fereloo.com" className="transition hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
