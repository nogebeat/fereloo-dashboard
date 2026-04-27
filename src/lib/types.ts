export type TenantStatus = 'provisioning' | 'active' | 'failed' | 'suspended';
export type PlanId = 'basic' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  priceFcfa: number;
  period: string;
  features: string[];
  highlighted?: boolean;
}

export interface Tenant {
  id: string;
  subdomain: string;
  status: TenantStatus;
  plan: PlanId;
  createdAt: string;
  url: string;
  region: string;
}

export interface ProvisioningLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

export interface ProvisioningProgress {
  tenantId: string;
  status: TenantStatus;
  progress: number; // 0-100
  currentStep: string;
  logs: ProvisioningLog[];
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceFcfa: 15000,
    period: '/mois',
    features: [
      '1 instance MariaDB',
      '5 GB de stockage',
      '10 000 requêtes / mois',
      'Sous-domaine fereloo.com',
      'Support email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceFcfa: 45000,
    period: '/mois',
    highlighted: true,
    features: [
      '3 instances MariaDB',
      '50 GB de stockage',
      '500 000 requêtes / mois',
      'Domaine personnalisé',
      'Backups automatiques',
      'Support prioritaire 24/5',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceFcfa: 150000,
    period: '/mois',
    features: [
      'Instances illimitées',
      '500 GB de stockage',
      'Requêtes illimitées',
      'SLA 99.95%',
      'Région dédiée',
      'Support 24/7 + CSM',
      'SSO & audit logs',
    ],
  },
];
