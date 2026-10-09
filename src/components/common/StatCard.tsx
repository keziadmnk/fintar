import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  variant?: 'default' | 'highlight' | 'subtle';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  return (
    <Card
      variant={variant === 'highlight' ? 'elevated' : 'default'}
      className={cn(
        'relative overflow-hidden',
        variant === 'highlight' && 'bg-gradient-to-br from-brand-950/70 via-slate-900 to-slate-900 border-brand-800/50',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="text-xl font-bold text-slate-100 tracking-tight">{value}</div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-brand-400 border border-slate-700/50">
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
          {trend ? (
            <div
              className={cn(
                'flex items-center gap-1 font-medium',
                trend.isNeutral
                  ? 'text-slate-400'
                  : trend.isPositive
                  ? 'text-emerald-400'
                  : 'text-red-400'
              )}
            >
              {trend.isNeutral ? (
                <Minus className="w-3.5 h-3.5" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          ) : (
            <span className="text-slate-400">{subtitle}</span>
          )}

          {trend && subtitle && (
            <span className="text-slate-500 truncate ml-2">{subtitle}</span>
          )}
        </div>
      )}
    </Card>
  );
};
