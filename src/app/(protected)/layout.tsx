"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { User } from '@supabase/supabase-js';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { t, language } = useI18n();
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes (including metadata updates via updateUser)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Check if user needs onboarding (no explotaciones created yet)
  useEffect(() => {
    if (!user || pathname === '/onboarding') return;
    
    async function checkOnboarding() {
      const { data, error } = await supabase
        .from('explotaciones')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1);
      
      if (!error && (!data || data.length === 0)) {
        router.push('/onboarding');
      }
    }
    checkOnboarding();
  }, [user, pathname, supabase, router]);

  return (
    <div className="flex h-screen w-full bg-[var(--color-base-100)] text-[color:var(--color-base-content)] overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed top-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-[120px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '10s' }} />
      <div className="fixed bottom-[20%] right-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-accent-blue)]/10 blur-[120px] animate-pulse pointer-events-none z-0" style={{ animationDuration: '14s', animationDelay: '3s' }} />
      
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 relative z-10 h-screen overflow-hidden w-full"
        style={{ marginLeft: isSidebarCollapsed ? '5rem' : '16rem' }}
      >
        <Header user={user} isCollapsed={isSidebarCollapsed} />
        
        {/* pt-16 to naturally clear fixed header without negative margins */}
        <main className="flex-1 w-full pt-16 h-full relative z-10 overflow-y-auto">
          <div className="animate-in fade-in duration-700 min-h-full w-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="w-full text-center py-8 mt-auto border-t border-white/5 flex flex-col gap-2">
              <p className="text-xs text-gray-500">
                {language === 'en'
                  ? '© 2026 IASOLUTIONS. All rights reserved.'
                  : '© 2026 IASOLUTIONS. Todos los derechos reservados.'}
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
                <Link href="/privacy-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.privacyPolicy')}</Link>
                <Link href="/cookie-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.cookiePolicy')}</Link>
                <Link href="/legal-notice" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.legalNotice')}</Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
