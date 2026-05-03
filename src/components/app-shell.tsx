import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { LayoutDashboard, Plus, LogOut, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';

function UserAvatar({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right md:block">
        <div className="text-[11px] font-bold uppercase tracking-tight leading-tight">{name}</div>
        <div className="font-mono text-[9px] leading-tight text-muted-foreground/60">{email}</div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-secondary font-mono text-[10px] font-bold text-foreground">
        {initials}
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const router = useRouterState();
  const path = router.location.pathname;

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: 'CONSOLE', href: '/dashboard' },
  ];

  if (path === '/provision') {
    crumbs.push({ label: 'PROVISIONING' });
  } else if (path.startsWith('/status/')) {
    crumbs.push({ label: 'STATUS' });
  }

  if (crumbs.length <= 1) return null;

  return (
    <div className="hidden items-center gap-2 font-mono text-[10px] font-bold tracking-[0.1em] text-muted-foreground/40 md:flex">
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-border">/</span>}
          {c.href ? (
            <Link to={c.href} className="transition hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground/70">{c.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-foreground text-background transition-transform group-hover:scale-105">
                <Zap className="h-4 w-4" fill="currentColor" />
              </span>
              <span className="text-xs font-bold uppercase tracking-tighter">Fereloo</span>
            </Link>

            <div className="hidden h-4 w-px bg-border md:block" aria-hidden />

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-[2px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    'inline-flex items-center gap-2 rounded-[2px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest bg-secondary text-foreground',
                }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Tableau de bord
              </Link>
            </nav>

            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/provision' })}
              className="hidden h-9 px-4 rounded-[2px] font-bold text-[10px] uppercase tracking-widest border-border hover:border-foreground transition-all sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Nouvelle instance
            </Button>

            {user && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-px bg-border mx-2 hidden md:block" />
                <UserAvatar name={user.name} email={user.email} />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={signOut}
                  aria-label="Déconnexion"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {children}
      </main>
    </div>
  );
}

