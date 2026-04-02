"use client";

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'premium';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = "" }: BadgeProps) {
  const variants = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
    success: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-white/5 text-white/50 border-white/10",
    premium: "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}
