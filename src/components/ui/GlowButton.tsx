import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function GlowButton({ className, variant = 'primary', isLoading, icon, children, ...props }: GlowButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-pink)] to-[var(--color-accent-warm)] text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] border border-transparent",
    secondary: "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20",
    ghost: "bg-transparent text-[color:var(--color-base-content)] hover:bg-white/5 border border-white/10 hover:border-white/20",
    premium: "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border-t border-white/20"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], isLoading && "opacity-70 cursor-not-allowed", className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
