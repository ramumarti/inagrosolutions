import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-[color:var(--color-base-content)] opacity-50 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[color:var(--color-base-content)] placeholder:text-[color:var(--color-base-content)] placeholder:opacity-40 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 focus:border-[var(--color-primary)]",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
