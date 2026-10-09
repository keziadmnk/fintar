import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ConfirmBarProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryVariant?: 'primary' | 'success' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  infoText?: string;
  className?: string;
}

export const ConfirmBar: React.FC<ConfirmBarProps> = ({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryVariant = 'primary',
  isLoading = false,
  disabled = false,
  infoText,
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-floating',
        className
      )}
    >
      {infoText && (
        <p className="text-xs text-slate-400 mb-2.5 text-center">{infoText}</p>
      )}
      <div className="flex items-center gap-3">
        {secondaryLabel && onSecondary && (
          <Button
            variant="secondary"
            size="md"
            onClick={onSecondary}
            disabled={isLoading}
            className="flex-1"
          >
            {secondaryLabel}
          </Button>
        )}
        <Button
          variant={primaryVariant}
          size="md"
          onClick={onPrimary}
          isLoading={isLoading}
          disabled={disabled}
          className={cn(secondaryLabel ? 'flex-1' : 'w-full')}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
};
