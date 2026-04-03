"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Hexagon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const origin = window.location.origin;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/`,
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(t('forgot.success'), 'success');
      setEmail('');
    }
  };

  return (
    <GlassCard className="flex flex-col items-center w-full max-w-md mx-auto p-8 sm:p-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Hexagon className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2 glow-text text-center">
        {t('forgot.title')}
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-sm">
        {t('app.name')}
      </p>

      <form onSubmit={handleReset} className="w-full flex flex-col gap-4">
        <Input 
          type="email" 
          placeholder={t('login.email')} 
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <GlowButton type="submit" isLoading={loading} className="w-full mt-2">
          {t('forgot.submit')}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link href="/login" className="text-[color:var(--color-base-content)] opacity-70 hover:opacity-100 transition-colors">
          {t('forgot.back')}
        </Link>
      </div>
    </GlassCard>
  );
}
