import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Rocket,
  BarChart3,
  Users,
  Menu,
  X,
  Database,
  Globe,
  Cpu
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';

const FEATURES = [
  { id: '01', title: 'Isolation Totale', desc: 'Base MariaDB et cache Redis dédiés par client.' },
  { id: '02', title: 'Déploiement Éclair', desc: 'Installation de votre CRM en moins de 90 secondes.' },
  { id: '03', title: 'Paiement Local', desc: 'Gestion native de Wave et Mobile Money.' },
  { id: '04', title: 'Support Réactif', desc: 'Équipe d\'assistance basée en Afrique de l\'Ouest.' },
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* ── HEADER ── */}
      <header className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-foreground flex items-center justify-center text-background rounded-[2px]">
            <Zap className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="text-sm font-bold uppercase tracking-tighter">Fereloo</span>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Système</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
          <button onClick={() => signIn()} className="hover:text-foreground transition-colors">Connexion</button>
          <button 
            onClick={() => signIn()} 
            className="bg-foreground text-background px-4 py-2 hover:bg-foreground/90 transition-all rounded-[2px]"
          >
            [ Démarrer ]
          </button>
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background pt-24 px-8 md:hidden border-b border-border">
           <nav className="flex flex-col gap-8 text-sm font-bold uppercase tracking-widest">
              <a href="#features" onClick={() => setMobileOpen(false)}>Système</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)}>Tarifs</a>
              <button onClick={() => signIn()} className="text-left">Démarrer</button>
           </nav>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-20 md:pt-32 md:pb-32 border-b border-border">
        <div className="max-w-4xl">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8">
            // Infrastructure_Orchestration_v2
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-12 font-display">
            Gérez vos clients.<br/>
            <span className="text-muted-foreground/30 italic">Propulsez votre croissance.</span>
          </h1>
          <p className="max-w-xl text-sm md:text-lg text-muted-foreground leading-relaxed mb-12 font-medium">
            La plateforme SaaS qui automatise le déploiement de vos instances Frappe CRM. 
            Une infrastructure isolée, sécurisée et optimisée pour les PME en Afrique.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Button 
              size="lg" 
              onClick={() => signIn()} 
              className="h-12 px-8 rounded-[2px] font-bold text-xs uppercase tracking-widest shadow-none"
            >
              Exécuter le déploiement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="font-mono text-[10px] text-muted-foreground uppercase leading-tight">
              &gt; Aucun frais caché<br/>
              &gt; Prêt en 90 secondes
            </div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM SPECS (FEATURES) ── */}
      <section id="features" className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 border-b border-border divide-y md:divide-y-0 md:divide-x divide-border">
        {FEATURES.map((f) => (
          <div key={f.id} className="p-8 group hover:bg-secondary/50 transition-colors">
            <div className="font-mono text-[10px] text-muted-foreground mb-6 opacity-40 group-hover:opacity-100 transition-opacity">ID_{f.id}</div>
            <h3 className="text-sm font-bold uppercase tracking-tight mb-3">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── ARCHITECTURE MOCKUP ── */}
      <section className="bg-secondary/20 py-20 md:py-32 border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
           <div className="border border-border bg-background p-1 md:p-2 rounded-[4px] shadow-2xl">
              <div className="bg-secondary/30 aspect-video rounded-[2px] flex items-center justify-center relative overflow-hidden">
                 <div className="grid grid-cols-3 gap-8 md:gap-16 relative z-10 scale-75 md:scale-100">
                    <div className="flex flex-col items-center gap-4">
                       <Database className="h-10 w-10 text-muted-foreground" />
                       <div className="h-1 w-12 bg-border" />
                       <span className="font-mono text-[9px] uppercase font-bold">SQL_DB</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                       <Cpu className="h-10 w-10 text-foreground" />
                       <div className="h-1 w-12 bg-primary" />
                       <span className="font-mono text-[9px] uppercase font-bold text-primary">CRM_CORE</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                       <Globe className="h-10 w-10 text-muted-foreground" />
                       <div className="h-1 w-12 bg-border" />
                       <span className="font-mono text-[9px] uppercase font-bold">EDGE_NET</span>
                    </div>
                 </div>
                 {/* Decorative background lines */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-foreground)_1px,transparent_1px)] bg-[size:24px_24px]" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 md:py-40">
        <div className="mb-20">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">
            // Allocation_Tiers
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter">Des tarifs transparents.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {PLANS.map((p) => (
            <div key={p.id} className="bg-background p-10 flex flex-col group hover:bg-secondary/50 transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">{p.name}</div>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-4xl md:text-5xl font-black font-display tracking-tighter">{p.priceFcfa.toLocaleString('fr-FR')}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">FCFA{p.period}</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-12">
                {p.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                    <Check className="h-3 w-3 text-foreground" strokeWidth={3} /> {f}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => signIn()}
                variant="outline"
                className="w-full rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border group-hover:border-foreground transition-all"
              >
                Sélectionner
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mx-auto max-w-7xl px-6 py-20 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-foreground flex items-center justify-center text-background rounded-[1px]">
                 <Zap className="h-3 w-3" fill="currentColor" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter">Fereloo</span>
           </div>
           <div className="text-[10px] font-medium text-muted-foreground leading-loose">
              Solution de CRM SaaS isolée.<br/>
              © {new Date().getFullYear()} Fereloo Inc.<br/>
              Fait avec fierté en Afrique.
           </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
           <div className="flex flex-col gap-4">
              <span className="text-foreground/30">Produit</span>
              <a href="#" className="hover:text-foreground">Système</a>
              <a href="#" className="hover:text-foreground">Tarifs</a>
           </div>
           <div className="flex flex-col gap-4">
              <span className="text-foreground/30">Légal</span>
              <a href="#" className="hover:text-foreground">Confidentialité</a>
              <a href="#" className="hover:text-foreground">Conditions</a>
           </div>
           <div className="flex flex-col gap-4">
              <span className="text-foreground/30">Contact</span>
              <a href="mailto:hello@fereloo.com" className="hover:text-foreground">Email</a>
              <a href="#" className="hover:text-foreground">LinkedIn</a>
           </div>
        </div>
      </footer>

    </div>
  );
}
