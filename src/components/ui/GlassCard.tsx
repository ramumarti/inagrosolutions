import React from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass-panel p-8 w-full max-w-md relative z-10", className)} {...props}>
      {children}
    </div>
  );
}
