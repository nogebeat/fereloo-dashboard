import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/sonner";
import { Zap } from "lucide-react";
import { useEffect } from "react";
import { setTokenGetter } from "@/lib/api";
import appCss from "../styles.css?url";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 max-w-md text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
          Error 404
        </div>
        <h1 className="mt-3 text-6xl font-semibold tracking-tight">Lost in transit</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La route demandée n'existe pas dans le router Fereloo.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground glow-primary transition-colors hover:bg-primary/90"
        >
          <Zap className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1d2230" },
      { title: "Fereloo — Provisioning Console" },
      { name: "description", content: "Console de provisioning multi-tenant pour Fereloo." },
      { property: "og:title", content: "Fereloo — Provisioning Console" },
      { property: "og:description", content: "Provisioning-as-a-Service pour SaaS multi-tenant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          {children}
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}

function TokenSync() {
  const { getToken } = useClerkAuth();
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TokenSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
