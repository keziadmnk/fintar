import React from 'react';
import { AlertLevel } from '../../types';
import { cn } from '../../lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertCardProps {
  level: AlertLevel;
  title: string;
  detail: string;
  suggestedAction?: string;
  actionRoute?: string;
  onActionClick?: () => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  level,
  title,
  detail,
  suggestedAction,
  actionRoute,
  onActionClick,
  className,
}) => {
  const config = {
    critical: {
      border: 'border-[#FCA5A5]/60 hover:border-[#EF4444]',
      bg: 'bg-[#FFF1F2]', // Soft pink-red background as in image
      icon: <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />,
      titleColor: 'text-[#1E293B]',
      detailColor: 'text-[#64748B]',
      actionText: 'text-[#EF4444] hover:text-[#DC2626]',
    },
    warning: {
      border: 'border-[#FDE68A] hover:border-[#F59E0B]',
      bg: 'bg-[#FFFBEB]',
      icon: <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />,
      titleColor: 'text-[#1E293B]',
      detailColor: 'text-[#64748B]',
      actionText: 'text-[#D97706] hover:text-[#B45309]',
    },
    positive: {
      border: 'border-[#A7F3D0] hover:border-[#10B981]',
      bg: 'bg-[#ECFDF5]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />,
      titleColor: 'text-[#1E293B]',
      detailColor: 'text-[#64748B]',
      actionText: 'text-[#059669] hover:text-[#047857]',
    },
  }[level];

  const content = (
    <div
      className={cn(
        'rounded-[22px] p-4 border transition-all duration-200 relative',
        config.bg,
        config.border,
        actionRoute || onActionClick ? 'cursor-pointer active:scale-[0.99]' : '',
        className
      )}
      onClick={onActionClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-bold text-sm leading-snug', config.titleColor)}>{title}</h4>
          <p className={cn('text-xs mt-1 leading-relaxed', config.detailColor)}>{detail}</p>

          {suggestedAction && (
            <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-xs font-semibold">
              <span className={config.actionText}>{suggestedAction}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (actionRoute) {
    return <Link to={actionRoute} className="block no-underline">{content}</Link>;
  }

  return content;
};
