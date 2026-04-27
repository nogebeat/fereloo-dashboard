import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Fereloo — Provisioning-as-a-Service' },
      {
        name: 'description',
        content:
          'Déployez vos tenants applicatifs multi-tenant en moins de 90 secondes. Base de données, sous-domaines TLS et monitoring automatisés.',
      },
      { property: 'og:title', content: 'Fereloo — Provisioning-as-a-Service' },
      {
        property: 'og:description',
        content:
          'Plateforme SaaS de provisionnement automatisé : MariaDB, sous-domaines, TLS, monitoring temps réel.',
      },
    ],
  }),
  component: LandingPage,
});
