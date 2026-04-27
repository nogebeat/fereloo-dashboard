import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Fereloo — Le CRM des PME africaines' },
      {
        name: 'description',
        content:
          "Centralisez vos clients, suivez vos ventes et alignez votre équipe commerciale. Sans Excel, sans technicien, facturé en FCFA.",
      },
      { property: 'og:title', content: 'Fereloo — Le CRM des PME africaines' },
      {
        property: 'og:description',
        content:
          "Plus de clients, moins de chaos. Le CRM pensé pour les dirigeants et équipes commerciales en Afrique.",
      },
    ],
  }),
  component: LandingPage,
});
