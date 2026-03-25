import React from 'react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[var(--color-base-100)] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-primary)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-[var(--color-accent-pink)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full bg-[var(--color-accent-blue)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full px-4 flex justify-center fade-in-section">
        {children}
      </div>
    </main>
  );
}
