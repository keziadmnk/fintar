import React from 'react';
import { cn } from '../../lib/utils';
import { Info } from 'lucide-react';

interface SimulatedDataBadgeProps {
  className?: string;
  variant?: 'inline' | 'banner';
}

export const SimulatedDataBadge: React.FC<SimulatedDataBadgeProps> = ({
  className,
  variant = 'inline',
}) => {
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300',
          className
        )}
      >
        <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Simulated data:</strong> Products & rates are illustrative for demo. Final decisions belong to licensed institutions.
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700',
        className
      )}
      title="Simulated product for demonstration purposes"
    >
      <Info className="w-2.5 h-2.5 text-brand-400" />
      Simulated data
    </span>
  );
};
