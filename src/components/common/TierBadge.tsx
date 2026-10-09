import React from 'react';
import { PermissionTier } from '../../types';
import { cn } from '../../lib/utils';
import { Eye, Sparkles, ShieldCheck, Ban } from 'lucide-react';

interface TierBadgeProps {
  tier: PermissionTier;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  showLabel = true,
  className,
  size = 'sm',
}) => {
  const configs = {
    T0: {
      label: 'T0 Read',
      desc: 'Automatic Read',
      bg: 'bg-sky-950/60 text-sky-300 border-sky-600/40',
      icon: <Eye className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    T1: {
      label: 'T1 Suggest',
      desc: 'AI Recommendation',
      bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-600/40',
      icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    T2: {
      label: 'T2 Act',
      desc: 'Approval Required',
      bg: 'bg-amber-950/60 text-amber-300 border-amber-600/40',
      icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    T3: {
      label: 'T3 Forbidden',
      desc: 'Blocked by Safety Policy',
      bg: 'bg-red-950/60 text-red-300 border-red-600/40',
      icon: <Ban className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  }[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-mono font-medium border uppercase tracking-wider',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        configs.bg,
        className
      )}
      title={`${configs.label}: ${configs.desc}`}
    >
      {configs.icon}
      {showLabel ? configs.label : tier}
    </span>
  );
};
