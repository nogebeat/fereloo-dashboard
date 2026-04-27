import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TenantStatus } from '@/lib/types';

const STATUS_CONFIG: Record<
  TenantStatus,
  { label: string; className: string; dotClassName: string; pulse?: boolean }
> = {
  active: {
    label: 'Active',
    className: 'border-success/30 bg-success/10 text-success',
    dotClassName: 'bg-success',
  },
  provisioning: {
    label: 'Provisioning',
    className: 'border-primary/30 bg-primary/10 text-primary',
    dotClassName: 'bg-primary',
    pulse: true,
  },
  failed: {
    label: 'Failed',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive',
  },
  suspended: {
    label: 'Suspended',
    className: 'border-warning/30 bg-warning/10 text-warning',
    dotClassName: 'bg-warning',
  },
};

export function StatusBadge({ status, className }: { status: TenantStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-mono text-[10px] uppercase tracking-wider', cfg.className, className)}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          cfg.dotClassName,
          cfg.pulse && 'animate-pulse-glow',
        )}
      />
      {cfg.label}
    </Badge>
  );
}
