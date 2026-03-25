"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  return (
    <div className="flex h-screen w-full bg-[var(--color-base-100)] text-[color:var(--color-base-content)] overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed top-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[var(--color-primary)]/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
      <div className="fixed bottom-[20%] right-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-accent-blue)]/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '14s', animationDelay: '3s' }} />
      
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 relative z-10 h-screen overflow-hidden"
        style={{ marginLeft: isSidebarCollapsed ? '5rem' : '16rem' }}
      >
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="animate-in fade-in duration-700 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
