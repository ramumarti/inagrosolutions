"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Building2 } from 'lucide-react';
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
        router.push('/enrutar');
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
    <GlassCard className="flex flex-col items-center w-full max-w-md mx-auto p-8 sm:p-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Building2 className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-black mb-2 glow-text text-center uppercase tracking-tighter">
        Acceso a la Plataforma
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-xs font-bold uppercase tracking-widest">
        Gestión de Entidades y Cuadernos
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
        
        <GlowButton type="submit" isLoading={loading} className="w-full mt-4 text-lg py-6 font-black uppercase tracking-widest">
          {t('login.submit')}
        </GlowButton>
      </form>

      <div className="mt-8 flex flex-col items-center gap-3 text-xs">
        <Link href="/forgot-password" className="text-white/50 hover:text-white transition-colors uppercase font-bold tracking-tight">
          {t('login.forgot')}
        </Link>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-white/30 uppercase font-black">¿Aún no eres partner?</span>
          <Link href="/signup" className="text-[var(--color-primary)] font-bold hover:underline uppercase">
            REGISTRAR ENTIDAD GRATIS
          </Link>
        </div>
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
