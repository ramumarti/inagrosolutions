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
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const origin = window.location.origin;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/?verified=true`,
        data: {
          first_name: firstName,
          last_name: lastName,
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
    <GlassCard className="flex flex-col items-center">
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
