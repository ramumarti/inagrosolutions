"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { t, language } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      toast(language === 'en' ? 'You must accept the privacy policy' : 'Debes aceptar la política de privacidad', 'error');
      return;
    }

    if (isBusiness && !companyName) {
      toast(language === 'en' ? 'Company name is required' : 'El nombre de la empresa es obligatorio', 'error');
      return;
    }

    setLoading(true);
    
    const origin = window.location.origin;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          is_business: isBusiness,
          company_name: isBusiness ? companyName : null,
          platform_role: isBusiness ? 'tenant_admin' : 'farmer'
        }
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(t('signup.success'), 'success');
      router.push('/login');
    }
  };

  return (
    <GlassCard className="flex flex-col items-center w-full max-w-md mx-auto p-8 sm:p-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Hexagon className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2 glow-text text-center">
        {t('signup.title')}
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-sm">
        {t('app.name')}
      </p>

      <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            type="text" 
            placeholder={t('signup.firstName')} 
            icon={<User className="w-5 h-5" />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input 
            type="text" 
            placeholder={t('signup.lastName')} 
            icon={<User className="w-5 h-5" />}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl mb-2">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${!isBusiness ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            onClick={() => setIsBusiness(false)}
          >
            {language === 'en' ? 'Individual' : 'Particular'}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${isBusiness ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            onClick={() => setIsBusiness(true)}
          >
            {language === 'en' ? 'Enterprise' : 'Empresa / Coop.'}
          </button>
        </div>

        {isBusiness && (
          <Input 
            type="text" 
            placeholder={language === 'en' ? 'Company / Cooperative Name' : 'Nombre de la Empresa / Cooperativa'} 
            icon={<Hexagon className="w-5 h-5" />}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="animate-in fade-in slide-in-from-top-2 duration-300"
          />
        )}

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
        
        <div className="flex items-start gap-3 px-1 my-2">
          <input 
            type="checkbox" 
            id="privacy" 
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50 cursor-pointer"
          />
          <label htmlFor="privacy" className="text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
            {t('gdpr.accept')}{' '}
            <Link href="/privacy-policy" className="text-[var(--color-primary)] hover:underline" target="_blank">
              ({t('gdpr.privacyPolicy')})
            </Link>
          </label>
        </div>
        
        <GlowButton type="submit" isLoading={loading} className="w-full">
          {t('signup.submit')}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link href="/login" className="text-[color:var(--color-base-content)] opacity-70 hover:opacity-100 transition-colors">
          {t('signup.login')}
        </Link>
      </div>
    </GlassCard>
  );
}
