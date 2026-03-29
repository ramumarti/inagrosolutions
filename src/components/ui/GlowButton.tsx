import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
}

export function GlowButton({ className, variant = 'primary', isLoading, children, ...props }: GlowButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-pink)] to-[var(--color-accent-warm)] text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-transparent",
    ghost: "bg-transparent text-[color:var(--color-base-content)] hover:bg-white/5 border border-white/10 hover:border-white/20"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], isLoading && "opacity-70 cursor-not-allowed", className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
