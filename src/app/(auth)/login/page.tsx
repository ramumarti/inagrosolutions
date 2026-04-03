"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast(t('toast.verified'), 'success');
    }
    if (searchParams.get('error') === 'auth-link-failed') {
      toast(t('toast.authlinkfailed'), 'error');
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/cuaderno');
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, searchParams, t, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    }
  };

  return (
    <GlassCard className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Hexagon className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2 glow-text text-center">
        {t('login.hero_title')}
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-sm">
        {t('app.tagline')}
      </p>

      <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
        <Input 
          type="email" 
          placeholder={t('login.email')} 
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input 
          type="password" 
          placeholder={t('login.password')} 
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <GlowButton type="submit" isLoading={loading} className="w-full mt-2">
          {t('login.submit')}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link href="/forgot-password" className="text-[color:var(--color-accent-blue)] hover:text-white transition-colors">
          {t('login.forgot')}
        </Link>
        <Link href="/signup" className="text-[color:var(--color-base-content)] opacity-70 hover:opacity-100 transition-colors">
          {t('login.signup')}
        </Link>
      </div>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
