import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'glass' | 'elevated' | 'subtle' | 'hero' | 'dark';
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  isInteractive = false,
  ...props
}) => {
  const variantStyles = {
    default: 'card-white text-slate-800',
    outline: 'bg-transparent border border-slate-200 text-slate-700',
    glass: 'bg-white/80 backdrop-blur-md border border-slate-100 shadow-card text-slate-800',
    elevated: 'bg-white border border-slate-100 shadow-card-hover text-slate-800 rounded-3xl',
    subtle: 'bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl',
    hero: 'card-hero-blue text-white',
    dark: 'card-dark-ai text-white',
  };

  return (
    <div
      className={cn(
        'transition-all duration-200 p-4',
        variantStyles[variant],
        isInteractive && 'cursor-pointer hover:border-slate-300 active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
