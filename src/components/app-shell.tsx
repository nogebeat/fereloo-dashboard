import { Link, useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { LayoutDashboard, Plus, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-semibold tracking-tight">Fereloo</span>
              <span className="hidden rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground sm:inline">
                console
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: 'rounded-md px-3 py-1.5 text-sm bg-accent text-foreground' }}
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate({ to: '/provision' })}
              className="hidden sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Nouvelle instance
            </Button>
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden text-right md:block">
                  <div className="text-xs font-medium leading-tight">{user.name}</div>
                  <div className="font-mono text-[10px] leading-tight text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={signOut} aria-label="Déconnexion">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
