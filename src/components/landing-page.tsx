import { useState, useEffect } from 'react';
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
  Menu,
  X,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';
import dashboardDemo from '@/assets/dashboard-demo.jpg';

const STATS = [
  { value: '500+', label: 'Entreprises actives' },
  { value: '12', label: 'Pays en Afrique' },
  { value: '99,9%', label: 'Disponibilité garantie' },
];

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
      "Historique client complet en un coup d'œil",
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
      "Prévisionnel de chiffre d'affaires",
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
    q: "Faut-il être technicien pour l'utiliser ?",
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

const NAV_LINKS = [
  { href: '#benefices', label: 'Bénéfices' },
  { href: '#cas-usage', label: "Cas d'usage" },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">

      {/* Atmospheric background layers */}
      <div className="bg-grid-lines pointer-events-none fixed inset-0 z-0 opacity-40" aria-hidden />
      <div className="bg-dot-grid pointer-events-none fixed inset-0 z-0 opacity-30" aria-hidden />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[600px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% -10%, oklch(0.55 0.22 295 / 0.15) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* ── HEADER ── */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Fereloo</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => signIn()}
            className="hidden rounded-md border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:block"
          >
            Se connecter
          </button>
          <button
            onClick={() => signIn()}
            className="hidden rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 md:block"
          >
            Commencer
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/50 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="relative z-20 border-b border-border bg-background/96 px-4 pb-4 backdrop-blur md:hidden">
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => { setMobileOpen(false); signIn(); }}
              className="mt-2 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Commencer gratuitement
            </button>
          </nav>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-24">

          {/* Left: copy */}
          <div className="flex-1 lg:max-w-[52%]">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
              Le CRM des PME africaines
            </div>

            <h1 className="animate-fade-up animation-delay-100 mt-6 font-display text-[58px] font-extrabold leading-[1.02] tracking-tight md:text-7xl lg:text-[76px]">
              Plus de clients.
              <br />
              <span className="text-gradient-primary">Moins de chaos.</span>
            </h1>

            <p className="animate-fade-up animation-delay-200 mt-6 max-w-lg text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
              Centralisez vos clients, suivez vos ventes et alignez votre équipe commerciale —
              sans Excel, sans technicien, facturé en FCFA.
            </p>

            <div
              id="commencer"
              className="animate-fade-up animation-delay-300 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="h-11 glow-primary shrink-0 font-semibold"
                onClick={() => signIn()}
              >
                Démarrer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground sm:pl-1">
                Aucune carte bancaire requise
              </span>
            </div>

            <div className="animate-fade-up animation-delay-400 mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" /> Sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" /> Prêt en 90 secondes
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" /> Facturé en FCFA
              </span>
            </div>
          </div>

          {/* Right: dashboard preview */}
          <div className="animate-fade-up animation-delay-200 relative flex-1 lg:max-w-[48%]">
            <div className="relative overflow-hidden rounded-xl border border-white/8 shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-white/8 bg-[oklch(0.19_0_0)] px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
                <div className="ml-2 flex-1 rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] text-muted-foreground/70">
                  app.fereloo.com/dashboard
                </div>
              </div>
              <img
                src={dashboardDemo}
                alt="Aperçu du tableau de bord Fereloo"
                className="w-full object-cover"
                loading="lazy"
              />
              {/* Bottom gradient overlay */}
              <div
                className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                style={{ background: 'linear-gradient(to top, oklch(0.17 0 0 / 0.6), transparent)' }}
              />
            </div>

            {/* Floating stat — bottom left */}
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-md md:flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-tight">+34%</p>
                <p className="font-mono text-[10px] text-muted-foreground">de conversions</p>
              </div>
            </div>

            {/* Floating stat — top right */}
            <div className="absolute -right-4 top-12 hidden rounded-xl border border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-md md:flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-sm font-bold leading-tight">Wave ✓</p>
                <p className="font-mono text-[10px] text-muted-foreground">paiement intégré</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 border-y border-border/40 bg-card/15 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <span className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  {value}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="relative z-10 bg-card/10 py-4">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            {[
              'Commerce & Retail',
              'Services & Conseil',
              'Distribution B2B',
              'Immobilier',
              'Logistique',
              'Agroalimentaire',
            ].map((sector, i, arr) => (
              <span key={sector} className="flex items-center gap-6">
                <span>{sector}</span>
                {i < arr.length - 1 && (
                  <span className="text-border/50" aria-hidden>·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BÉNÉFICES ── */}
      <section
        id="benefices"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 md:px-6 md:pb-28"
      >
        <div className="mb-12 max-w-xl">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            <span className="h-px w-4 bg-primary" />
            Pourquoi Fereloo
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Ce que Fereloo change
            <br className="hidden md:block" />
            <span className="text-muted-foreground"> pour votre entreprise</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Concret, mesurable, dès la première semaine.
          </p>
        </div>

        <div className="grid gap-px rounded-xl border border-border overflow-hidden bg-border md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="group relative bg-card p-6 transition-colors hover:bg-accent/20 overflow-hidden"
            >
              {/* Background number */}
              <span className="pointer-events-none absolute right-3 top-0 select-none font-display text-[80px] font-extrabold leading-none text-border/20 transition-colors group-hover:text-primary/8">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 font-display text-base font-bold">{b.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAS D'USAGE ── */}
      <section
        id="cas-usage"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28"
      >
        <div className="mb-12">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            <span className="h-px w-4 bg-primary" />
            Secteurs
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Adapté à votre métier
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Trois exemples parmi des dizaines de secteurs déjà accompagnés.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="group flex flex-col rounded-xl border border-border bg-card/60 p-6 transition-all hover:border-primary/40 hover:bg-card/80"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <u.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {u.sector}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.desc}</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
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

      {/* ── TARIFS ── */}
      <section
        id="tarifs"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28"
      >
        <div className="mb-12 text-center">
          <p className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            <span className="h-px w-4 bg-primary" />
            Tarifs
            <span className="h-px w-4 bg-primary" />
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Des tarifs simples, en FCFA
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Sans engagement. Vous changez de formule quand vous voulez.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card/70 p-6 transition-all',
                p.highlighted
                  ? 'border-primary/60 glow-primary'
                  : 'border-border hover:border-primary/30',
              )}
            >
              {p.highlighted && (
                <>
                  {/* Top accent strip */}
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30">
                    <Sparkles className="h-3 w-3" />
                    Le plus choisi
                  </span>
                </>
              )}
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight">
                  {p.priceFcfa.toLocaleString('fr-FR')}
                </span>
                <span className="text-sm text-muted-foreground">FCFA{p.period}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground/70">
                {p.users} utilisateurs · {p.storageGb} Go
              </div>
              <div className="mt-5 mb-6 h-px bg-border/60" />
              <ul className="flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => signIn()}
                variant={p.highlighted ? 'default' : 'outline'}
                className={cn('mt-6', p.highlighted && 'glow-primary font-semibold')}
              >
                Choisir {p.name}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="relative z-10 mx-auto max-w-3xl px-4 pb-20 md:px-6 md:pb-28"
      >
        <div className="mb-12 text-center">
          <p className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            <span className="h-px w-4 bg-primary" />
            FAQ
            <span className="h-px w-4 bg-primary" />
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Questions fréquentes
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border bg-card/60"
        >
          {FAQ.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-border px-5 last:border-b-0"
            >
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-10 text-center md:p-16">
          {/* Layered background glows */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 120%, oklch(0.55 0.22 295 / 0.12) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, oklch(0.55 0.22 295 / 0.4), transparent)',
            }}
            aria-hidden
          />

          <p className="relative font-mono text-[11px] uppercase tracking-wider text-primary">
            Prêt à structurer votre commercial ?
          </p>
          <h2 className="relative mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Rejoignez les PME africaines
            <br className="hidden md:block" />
            <span className="text-muted-foreground text-2xl md:text-3xl"> qui ont arrêté de perdre leurs clients dans Excel.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Configuration en quelques minutes. Aucune carte bancaire requise.
          </p>
          <Button
            size="lg"
            className="relative mt-8 h-12 glow-primary font-semibold"
            onClick={() => signIn()}
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="relative mt-4 text-xs text-muted-foreground">
            Sans carte bancaire · Sans engagement · Made in Africa
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground md:flex-row md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
              <Zap className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-foreground">Fereloo</span>
            <span className="text-border/60">·</span>
            <span>© {new Date().getFullYear()} · Made in Africa</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="transition hover:text-foreground">Confidentialité</a>
            <a href="#" className="transition hover:text-foreground">Conditions</a>
            <a href="mailto:hello@fereloo.com" className="transition hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
