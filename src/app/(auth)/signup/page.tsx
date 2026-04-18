"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon, User, Building2, ShieldCheck } from 'lucide-react';
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
  const [companyName, setCompanyName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lawAccepted, setLawAccepted] = useState(false);
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

    if (!lawAccepted) {
      toast(language === 'en' ? 'You must accept the SIEX/RD 1054/2022 regulations' : 'Debes aceptar la normativa SIEX y el RD 1054/2022', 'error');
      return;
    }

    if (!companyName) {
      toast(language === 'en' ? 'Entity name is required' : 'El nombre de la entidad es obligatorio', 'error');
      return;
    }

    setLoading(true);
    
    // Determine the redirect origin. Force production URL if not on localhost.
    const origin = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? window.location.origin 
      : 'https://inagrosolutions.com';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm`,
        data: {
          first_name: firstName,
          last_name: lastName,
          is_business: true,
          company_name: companyName,
          platform_role: 'tenant_admin',
          is_partner_reg: true // Internal flag for partner flow
        }
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(language === 'en' ? 'Account created successfully! Please check your email.' : '¡Cuenta creada con éxito! Por favor, revisa tu correo.', 'success');
      router.push('/login');
    }
  };

  return (
    <GlassCard className="flex flex-col items-center w-full max-w-md mx-auto p-8 sm:p-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Building2 className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-black mb-2 glow-text text-center uppercase tracking-tighter">
        Registro de Partner
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-xs font-bold uppercase tracking-widest">
        Exclusivo para Entidades y Cooperativas
      </p>

      <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
        {/* Entity Section */}
        <div className="space-y-4 mb-2">
          <Input 
            type="text" 
            placeholder="Nombre de la Entidad / Cooperativa" 
            icon={<Hexagon className="w-5 h-5" />}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="border-[var(--color-primary)]/20"
          />
        </div>

        {/* Responsible Person */}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            type="text" 
            placeholder="Nombre Responsable" 
            icon={<User className="w-5 h-5" />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input 
            type="text" 
            placeholder="Apellidos" 
            icon={<User className="w-5 h-5" />}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input 
          type="email" 
          placeholder="Email de Administración" 
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input 
          type="password" 
          placeholder="Crear Contraseña" 
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Compliance Section */}
        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3 px-1">
            <input 
              type="checkbox" 
              id="privacy" 
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50 cursor-pointer"
              required
            />
            <label htmlFor="privacy" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
              Acepto la <Link href="/privacy-policy" className="text-[var(--color-primary)] hover:underline" target="_blank">Política de Privacidad</Link>
            </label>
          </div>

          <div className="flex items-start gap-3 px-1">
            <input 
              type="checkbox" 
              id="legislation" 
              checked={lawAccepted}
              onChange={(e) => setLawAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50 cursor-pointer"
              required
            />
            <label htmlFor="legislation" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
              Acepto la normativa <span className="text-white">RD 1054/2022</span> y <Link href="/partner-policy" className="text-[var(--color-primary)] hover:underline">legislaciones específicas</Link> de la administración para el <span className="text-[var(--color-primary)]">Cuaderno de Campo Digital (SIEX)</span>.
            </label>
          </div>
        </div>
        
        <GlowButton type="submit" isLoading={loading} className="w-full mt-4 text-lg py-6 font-black uppercase tracking-widest">
          REGISTRAR ENTIDAD GRATIS
        </GlowButton>
      </form>

      <div className="mt-8 flex flex-col items-center gap-3 text-xs">
        <span className="text-white/30 uppercase font-black">¿Ya sois partners?</span>
        <Link href="/login" className="text-[var(--color-primary)] font-bold hover:underline">
          Inicia Sesión aquí
        </Link>
      </div>
    </GlassCard>
  );
}
