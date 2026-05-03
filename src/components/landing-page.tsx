import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Zap,
  Terminal,
  Database,
  Globe,
  Cpu,
  Shield,
  Activity
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';
import { PLANS } from '@/lib/types';
import { cn } from '@/lib/utils';

// Distilled Content
const CAPABILITIES = [
  { id: 'SYS-01', name: 'Database Isolation', desc: 'MariaDB instance per tenant. Zero cross-contamination.' },
  { id: 'SYS-02', name: 'Cache Layer', desc: 'Dedicated Redis for fast session and job queues.' },
  { id: 'SYS-03', name: 'Auto-TLS', desc: 'Let\'s Encrypt provisioned automatically on domain bind.' },
  { id: 'SYS-04', name: 'Local Billing', desc: 'Native integration with Wave & Mobile Money.' },
];

const METRICS = [
  { label: 'Uptime', value: '99.9%' },
  { label: 'Deploy Time', value: '< 90s' },
  { label: 'Active Instances', value: '500+' },
  { label: 'Regions', value: 'AF-WEST-1' },
];

export function LandingPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>('');

  // Clock effect for terminal feel
  useEffect(() => {
    const updateTime = () => setTime(new Date().toISOString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground font-sans overflow-x-hidden">
      
      {/* Structural Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.30_0.01_295/0.2)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.30_0.01_295/0.2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_10%,transparent_100%)]" />
      </div>

      {/* Main OS-like Window Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:p-8 min-h-screen flex flex-col">
        
        {/* TOP BAR / HEADER */}
        <header className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-8 w-8 bg-primary/10 text-primary border border-primary/20">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground flex flex-col">
              <span className="text-foreground">Fereloo_OS</span>
              <span>v2.0.1</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-success rounded-full animate-pulse"/> SYS_ONLINE</span>
            <span>{time}</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="font-mono text-[11px] uppercase tracking-wider h-8 rounded-none border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            onClick={() => signIn()}
          >
            [ Auth_Init ]
          </Button>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min">

          {/* HERO PANEL (Spans 8 cols) */}
          <div className="md:col-span-8 border border-border bg-card/40 backdrop-blur-sm p-6 md:p-10 flex flex-col justify-between relative overflow-hidden group">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />

            <div>
              <div className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Zap className="h-3 w-3" /> Core_Objective
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6">
                Deploy Frappe.<br/>
                <span className="text-muted-foreground">Without the devops.</span>
              </h1>
              <p className="max-w-md text-sm md:text-base text-muted-foreground/80 font-mono leading-relaxed">
                Centralized multi-tenant orchestration for African SMEs. 
                Full isolation, instant TLS, local billing. No Excel. No chaos.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:items-center">
              <Button 
                onClick={() => signIn()}
                className="h-12 px-8 rounded-none bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:bg-primary/90 transition-all border border-transparent hover:border-primary-foreground/20 active:scale-[0.98]"
              >
                Execute_Deploy <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider flex flex-col">
                <span>> No credit card</span>
                <span>> T_READY: ~90s</span>
              </div>
            </div>
          </div>

          {/* METRICS PANEL (Spans 4 cols) */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {METRICS.map((m, i) => (
              <div key={i} className="border border-border bg-card/20 p-4 flex flex-col justify-center transition-colors hover:bg-card/40">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{m.label}</div>
                <div className="font-display text-2xl font-bold tracking-tight text-foreground">{m.value}</div>
              </div>
            ))}
          </div>

          {/* CAPABILITIES SPEC SHEET (Spans 12 cols) */}
          <div className="md:col-span-12 border border-border bg-card/10 mt-4">
            <div className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/30 flex items-center gap-2">
              <Cpu className="h-3 w-3" /> System_Specs
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {CAPABILITIES.map((cap) => (
                <div key={cap.id} className="p-5 hover:bg-accent/10 transition-colors">
                  <div className="font-mono text-[10px] text-primary mb-3">{cap.id}</div>
                  <div className="font-display text-sm font-bold mb-2">{cap.name}</div>
                  <div className="font-mono text-xs text-muted-foreground/70 leading-relaxed">{cap.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICING MATRIX (Spans 12 cols) */}
          <div className="md:col-span-12 border border-border bg-card/10 mt-4 overflow-hidden">
             <div className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/30 flex items-center gap-2">
              <Shield className="h-3 w-3" /> Allocation_Tiers
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {PLANS.map((p) => (
                <div key={p.id} className={cn("p-6 flex flex-col relative", p.highlighted && "bg-primary/5")}>
                  {p.highlighted && (
                     <div className="absolute top-0 inset-x-0 h-0.5 bg-primary" />
                  )}
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground font-bold mb-4 flex items-center justify-between">
                    {p.name}
                    {p.highlighted && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 border border-primary/30">RECOMMENDED</span>}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-display text-4xl font-extrabold tracking-tighter">
                      {p.priceFcfa.toLocaleString('fr-FR')}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase">FCFA{p.period}</span>
                  </div>

                  <div className="flex-1">
                    <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3 border-b border-border pb-2">Limits</div>
                    <div className="font-mono text-xs text-foreground mb-1">> Users: {p.users}</div>
                    <div className="font-mono text-xs text-foreground mb-4">> Storage: {p.storageGb}GB</div>
                    
                    <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3 border-b border-border pb-2">Features</div>
                    <ul className="space-y-2 font-mono text-xs text-muted-foreground/80">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">></span> <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => signIn()}
                    variant={p.highlighted ? 'default' : 'ghost'}
                    className={cn(
                      "mt-8 w-full rounded-none font-mono text-xs uppercase tracking-widest border",
                      p.highlighted 
                        ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    Select_{p.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER / LOG OUTPUT (Spans 12 cols) */}
          <footer className="md:col-span-12 border border-border bg-black/40 p-4 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              <span>System_Ready // Awaiting Input</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">[ Privacy ]</a>
              <a href="#" className="hover:text-primary transition-colors">[ Terms ]</a>
              <a href="mailto:hello@fereloo.com" className="hover:text-primary transition-colors">[ Contact ]</a>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
