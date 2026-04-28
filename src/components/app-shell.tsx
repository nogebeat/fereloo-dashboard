import { Link, useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { LayoutDashboard, Plus, LogOut, Zap } from 'lucide-react';
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
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-xs font-bold text-primary">
        {initials}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">

          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-display font-bold tracking-tight">Fereloo</span>
              <span className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
                console
              </span>
            </Link>

            <div className="hidden h-4 w-px bg-border md:block" aria-hidden />

            <nav className="hidden items-center gap-0.5 md:flex">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm bg-accent text-foreground',
                }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Tableau de bord
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/provision' })}
              className="hidden sm:inline-flex"
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
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
