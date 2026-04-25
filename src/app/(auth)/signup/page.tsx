"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon, User, Building2, Leaf } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

function SignupPageContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lawAccepted, setLawAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan');
  const tenantSlug = searchParams?.get('tenant');

  // Determine if it's a Farmer/User signup or Partner signup
  const isFarmer = !!plan || !!tenantSlug;
  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
  
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

    if (!isFarmer && !companyName) {
      toast(language === 'en' ? 'Entity name is required for partners' : 'El nombre de la entidad es obligatorio', 'error');
      return;
    }

    setLoading(true);
    
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://inagrosolutions.com';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm`,
        data: {
          first_name: firstName,
          last_name: lastName,
          is_business: !isFarmer,
          company_name: isFarmer ? (companyName || null) : companyName,
          platform_role: isFarmer ? 'tenant_member' : 'tenant_admin',
          is_partner_reg: !isFarmer,
          plan_id: isFarmer ? plan : null,
          tenant_slug: tenantSlug || null
        }
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      const successTitle = language === 'en' ? 'Account Created!' : '¡Cuenta Creada!';
      const successMsg = language === 'en' 
        ? 'Check your email to confirm and proceed to the secure payment.' 
        : 'Confirma tu email ahora para proceder al pago seguro y activar tus servicios.';
      
      toast(successMsg, 'success');
      
      // We can redirect to a specific "Success / Wait for email" landing page if we had one
      // For now, /login is okay but the message is clear.
      router.push('/login?msg=awaiting-confirmation');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 p-4 min-h-screen pt-24 pb-12">
      <GlassCard className="flex flex-col items-center w-full p-8 sm:p-10 relative overflow-hidden">
        {/* Dynamic header depending on type of signup */}
        {isFarmer ? (
          <>
            <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-300" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter text-white">
              Crea tu Explotación
            </h1>
            {plan && (
               <p className="text-emerald-400 mb-8 text-center text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                 Plan seleccionado: {planName}
               </p>
            )}
            {!plan && (
              <p className="text-gray-400 mb-8 text-center text-xs font-bold uppercase tracking-widest">
                Acceso a Cuaderno Digital
              </p>
            )}
          </>
        ) : (
          <>
            <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-pink)]" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black mb-2 glow-text text-center uppercase tracking-tighter">
              Registro de Partner
            </h1>
            <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-xs font-bold uppercase tracking-widest">
              Exclusivo para Entidades y Cooperativas
            </p>
          </>
        )}

        <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="text" 
              placeholder="Nombre" 
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

          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder={isFarmer ? "Nombre de la Finca (Opcional)" : "Nombre de la Entidad / Cooperativa"} 
              icon={isFarmer ? <Leaf className="w-5 h-5" /> : <Hexagon className="w-5 h-5" />}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required={!isFarmer}
              className={!isFarmer ? "border-[var(--color-primary)]/20" : ""}
            />
          </div>

          <Input 
            type="email" 
            placeholder={isFarmer ? "Tu Correo Electrónico" : "Email de Administración"} 
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
                {isFarmer ? (
                  <>Acepto las condiciones del <span className="text-white">Cuaderno SIEX</span> y la exención de responsabilidad.</>
                ) : (
                  <>Acepto la normativa <span className="text-white">RD 1054/2022</span> y <Link href="/partner-policy" className="text-[var(--color-primary)] hover:underline">legislaciones específicas</Link> de la administración en SIEX.</>
                )}
              </label>
            </div>
          </div>
          
          <GlowButton 
            type="submit" 
            isLoading={loading} 
            className={`w-full mt-4 text-lg py-6 font-black uppercase tracking-widest ${isFarmer ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : ''}`}
          >
            {isFarmer ? 'CREAR MI CUENTA' : 'REGISTRAR ENTIDAD GRATIS'}
          </GlowButton>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs">
          <span className="text-white/30 uppercase font-black">
            {isFarmer ? '¿Ya tienes cuenta?' : '¿Ya sois partners?'}
          </span>
          <Link href="/login" className={`${isFarmer ? 'text-emerald-400' : 'text-[var(--color-primary)]'} font-bold hover:underline`}>
            Inicia Sesión aquí
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
