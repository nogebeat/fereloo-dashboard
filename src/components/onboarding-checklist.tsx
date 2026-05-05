import { Link } from '@tanstack/react-router';
import { Check, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Tenant } from '@/lib/types';

interface Step {
  id: string;
  label: string;
  description: string;
  done: boolean;
  action?: { label: string; href: string; external?: boolean };
}

interface Props {
  companyDone: boolean;
  tenants: Tenant[];
  onDismiss: () => void;
}

export function OnboardingChecklist({ companyDone, tenants, onDismiss }: Props) {
  const hasInstance = tenants.length > 0;
  const isActive = tenants.some((t) => t.status === 'active');
  const activeUrl = tenants.find((t) => t.status === 'active')?.url;

  const steps: Step[] = [
    {
      id: 'account',
      label: 'Créer un compte',
      description: 'Inscription et connexion à Fereloo.',
      done: true,
    },
    {
      id: 'company',
      label: 'Renseigner votre entreprise',
      description: "Nom et secteur d'activité.",
      done: companyDone,
    },
    {
      id: 'instance',
      label: 'Déployer une instance CRM',
      description: 'Lancer votre environnement Frappe CRM.',
      done: hasInstance,
      action: !hasInstance ? { label: 'Déployer', href: '/provision' } : undefined,
    },
    {
      id: 'access',
      label: 'Accéder à votre CRM',
      description: 'Se connecter et créer vos premiers contacts.',
      done: isActive,
      action:
        isActive && activeUrl
          ? { label: 'Ouvrir le CRM', href: activeUrl, external: true }
          : undefined,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mb-10 rounded-[4px] border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Mise en route
            </div>
            <div className="text-sm font-bold">
              {allDone ? 'Configuration terminée !' : `${doneCount} / ${steps.length} étapes complétées`}
            </div>
          </div>
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-foreground/60">
              {progress}%
            </span>
          </div>
        </div>

        {allDone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8 rounded-[2px] text-muted-foreground hover:text-foreground"
            title="Masquer"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Steps */}
      <div className="divide-y divide-border">
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} index={i + 1} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ step, index }: { step: Step & { action?: { label: string; href: string; external?: boolean } }; index: number }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-6 py-4 transition-colors',
        step.done ? 'opacity-50' : 'hover:bg-secondary/20',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border font-mono text-[11px] font-bold transition-colors',
          step.done
            ? 'border-foreground/20 bg-foreground text-background'
            : 'border-border bg-secondary text-muted-foreground',
        )}
      >
        {step.done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className={cn('text-sm font-bold', step.done && 'line-through decoration-foreground/30')}>
          {step.label}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground font-medium">
          {step.description}
        </div>
      </div>

      {/* CTA */}
      {step.action && !step.done && (
        step.action.external ? (
          <a
            href={step.action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-border bg-card px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary shrink-0"
          >
            {step.action.label}
            <ArrowRight className="h-3 w-3" />
          </a>
        ) : (
          <Link
            to={step.action.href as '/provision'}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-border bg-card px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary shrink-0"
          >
            {step.action.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )
      )}
    </div>
  );
}
