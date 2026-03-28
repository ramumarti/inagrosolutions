"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  isCollapsed?: boolean;
}

export function Header({ user, isCollapsed = false }: HeaderProps) {
  const { t } = useI18n();
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const firstName = user?.user_metadata?.first_name || 'Amigo';
  const lastName = user?.user_metadata?.last_name || '';
  const initials = firstName.charAt(0) + (lastName ? lastName.charAt(0) : '');
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header 
      className="h-16 border-b border-white/10 bg-[var(--color-base-200)]/40 backdrop-blur-xl flex items-center justify-between px-6 fixed top-0 right-0 z-50 transition-all duration-300"
      style={{ left: isCollapsed ? '5rem' : '16rem' }}
    >
      
      {/* Left: Search */}
      <div className="w-full max-w-sm">
        <div className="relative">
          <Input 
            type="text" 
            placeholder={t('dashboard.search')} 
            icon={<Search className="w-4 h-4" />}
            className="h-9 bg-white/5 border-white/10 text-sm focus:border-[var(--color-primary)]/50 pr-12"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-base-content)] opacity-50 pointer-events-none">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-5">
        
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        <div className="w-px h-6 bg-white/10" />

        {/* Notifications */}
        <button className="relative text-[color:var(--color-base-content)] opacity-70 hover:opacity-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-pink)] text-[9px] font-bold text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]">
            1
          </span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 outline-none p-1 rounded-full hover:bg-white/5 transition-colors focus:ring-2 focus:ring-[var(--color-primary)]/50"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-blue)] flex items-center justify-center shadow-md shadow-[var(--color-primary)]/20 text-white font-bold text-xs uppercase overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden md:flex flex-col items-start mr-1">
              <span className="text-sm font-semibold leading-tight text-white">{firstName} {lastName}</span>
            </div>
          </button>

          {profileOpen && (
            <>
              {/* Overlay for clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[var(--color-base-300)]/90 backdrop-blur-xl shadow-2xl p-1 z-50 animate-in slide-in-from-top-2 fade-in">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-sm font-medium text-white truncate">{firstName} {lastName}</p>
                  <p className="text-xs text-[color:var(--color-base-content)] opacity-60 truncate">{user?.email}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    router.push('/profile');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[color:var(--color-base-content)] opacity-80 hover:opacity-100 hover:bg-white/5 rounded-md transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4" />
                  {t('dashboard.profile')}
                </button>
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[color:var(--color-base-content)] opacity-80 hover:opacity-100 hover:bg-white/5 rounded-md transition-colors text-left">
                  <Settings className="w-4 h-4" />
                  {t('dashboard.settings')}
                </button>
                
                <div className="my-1 border-t border-white/10" />
                
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-md transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {t('dashboard.logout')}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
