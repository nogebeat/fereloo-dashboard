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
    <div className="flex items-center gap-2.5">
      <div className="hidden text-right md:block">
        <div className="text-xs font-medium leading-tight">{name}</div>
        <div className="font-mono text-[10px] leading-tight text-muted-foreground">{email}</div>
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-xs font-bold text-primary shadow-sm shadow-primary/10">
        {initials}
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const router = useRouterState();
  const path = router.location.pathname;

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: 'Console', href: '/dashboard' },
  ];

  if (path === '/provision') {
    crumbs.push({ label: 'Nouvelle instance' });
  } else if (path.startsWith('/status/')) {
    crumbs.push({ label: 'Déploiement' });
  }

  if (crumbs.length <= 1) return null;

  return (
    <div className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground md:flex">
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-border" />}
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="font-display font-bold tracking-tight">Fereloo</span>
              <span className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground sm:inline">
                console
              </span>
            </Link>

            <div className="hidden h-4 w-px bg-border md:block" aria-hidden />

            <nav className="hidden items-center gap-0.5 md:flex">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm bg-accent text-foreground',
                }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Tableau de bord
              </Link>
            </nav>

            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/provision' })}
              className="hidden h-8 gap-1.5 text-xs sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle instance
            </Button>

            {user && (
              <div className="flex items-center gap-1">
                <UserAvatar name={user.name} email={user.email} />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={signOut}
                  aria-label="Déconnexion"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
