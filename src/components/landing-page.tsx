import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Rocket,
  BarChart3,
  Users,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';
import dashboardDemo from '@/assets/dashboard-demo.jpg';

const FEATURES = [
  { 
    title: 'Isolation Totale', 
    desc: 'Vos données sont en sécurité dans une infrastructure dédiée et privée.',
    icon: ShieldCheck 
  },
  { 
    title: 'Vitesse Optimale', 
    desc: 'Une puissance de calcul réservée uniquement à votre entreprise.',
    icon: Rocket 
  },
  { 
    title: 'Gestion Locale', 
    desc: 'Facturation simplifiée et adaptée aux modes de paiement locaux.',
    icon: BarChart3 
  },
  { 
    title: 'Expertise Locale', 
    desc: 'Un accompagnement par des experts qui comprennent vos défis.',
    icon: Users 
  },
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white overflow-x-hidden text-pretty">
      
      {/* ── HEADER ── */}
      <header className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-foreground flex items-center justify-center text-background rounded-[4px]">
            <Zap className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="text-base font-bold tracking-tighter">Fereloo</span>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          <a href="#avantages" className="hover:text-foreground transition-colors">Avantages</a>
          <a href="#tarifs" className="hover:text-foreground transition-colors">Tarifs</a>
          <button onClick={() => signIn()} className="hover:text-foreground transition-colors">Connexion</button>
          <button 
            onClick={() => signIn()} 
            className="bg-foreground text-background px-5 py-2.5 hover:bg-foreground/90 transition-all rounded-[2px]"
          >
            Commencer
          </button>
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background pt-24 px-8 md:hidden">
           <nav className="flex flex-col gap-10 text-lg font-bold">
              <a href="#avantages" onClick={() => setMobileOpen(false)}>Avantages</a>
              <a href="#tarifs" onClick={() => setMobileOpen(false)}>Tarifs</a>
              <Button size="lg" onClick={() => signIn()} className="w-full">Démarrer</Button>
           </nav>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32 lg:py-40 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-10 font-display">
              Le CRM puissant.<br/>
              <span className="text-muted-foreground/40 italic">Sans la complexité.</span>
            </h1>
            <p className="max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed mb-12 font-medium">
              Propulsez votre gestion commerciale avec une plateforme SaaS automatisée. 
              Déployez votre propre instance Frappe CRM en un clic, sécurisée et isolée.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Button 
                size="lg" 
                onClick={() => signIn()} 
                className="h-14 px-10 rounded-[2px] font-bold text-xs uppercase tracking-widest shadow-none"
              >
                Démarrer l'essai gratuit <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="text-[11px] font-bold text-muted-foreground uppercase leading-tight tracking-wider">
                &gt; Prêt en 90 secondes<br/>
                &gt; Aucune carte requise
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
             <div className="absolute -inset-4 bg-secondary/50 rounded-2xl -z-10 blur-2xl opacity-50" />
             <div className="border border-border p-2 bg-background rounded-xl shadow-2xl rotate-1">
                <img 
                  src={dashboardDemo} 
                  alt="Aperçu de Fereloo" 
                  className="rounded-lg shadow-inner grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                />
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -left-6 bg-white border border-border p-4 shadow-xl rounded-lg animate-fade-in">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Système Opérationnel</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section id="avantages" className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 border-b border-border divide-y md:divide-y-0 md:divide-x divide-border">
        {FEATURES.map((f, i) => (
          <div key={i} className="p-10 group hover:bg-secondary/30 transition-colors">
            <div className="h-10 w-10 text-foreground mb-8">
              <f.icon strokeWidth={1.5} size={32} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-tight mb-4">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="mx-auto max-w-7xl px-6 py-24 md:py-40">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter">Nos Formules.</h2>
          <p className="text-muted-foreground mt-4 font-medium italic">Facturation simple en FCFA. Évolutif à tout moment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {PLANS.map((p) => (
            <div key={p.id} className="bg-background p-12 flex flex-col group hover:bg-secondary/20 transition-all duration-300">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-10">{p.name}</div>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-5xl font-black font-display tracking-tighter">{p.priceFcfa.toLocaleString('fr-FR')}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">FCFA{p.period}</span>
              </div>
              
              <ul className="flex-1 space-y-5 mb-16">
                <li className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight">
                  <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={3} /> {p.users} Utilisateurs
                </li>
                <li className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight">
                  <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={3} /> {p.storageGb} Go Stockage
                </li>
                {p.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-muted-foreground/30" strokeWidth={3} /> {f}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => signIn()}
                variant="outline"
                className="w-full h-12 rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border group-hover:border-foreground transition-all"
              >
                Choisir
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mx-auto max-w-7xl px-6 py-20 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-foreground flex items-center justify-center text-background rounded-[2px]">
                 <Zap className="h-4 w-4" fill="currentColor" />
              </div>
              <span className="text-sm font-bold uppercase tracking-tighter">Fereloo</span>
           </div>
           <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 leading-relaxed">
              Solution de CRM SaaS isolée.<br/>
              © {new Date().getFullYear()} Fereloo Inc.<br/>
              Fait avec fierté en Afrique.
           </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
           <div className="flex flex-col gap-5">
              <span className="text-foreground/20">Produit</span>
              <a href="#avantages" className="hover:text-foreground">Avantages</a>
              <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
           </div>
           <div className="flex flex-col gap-5">
              <span className="text-foreground/20">Légal</span>
              <a href="#" className="hover:text-foreground">Confidentialité</a>
              <a href="#" className="hover:text-foreground">Conditions</a>
           </div>
           <div className="flex flex-col gap-5">
              <span className="text-foreground/20">Contact</span>
              <a href="mailto:hello@fereloo.com" className="hover:text-foreground text-foreground">Email</a>
              <a href="#" className="hover:text-foreground">LinkedIn</a>
           </div>
        </div>
      </footer>

    </div>
  );
}
