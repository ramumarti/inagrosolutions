"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon, User, Building2, Phone, MapPin, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

function PartnerSignupContent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lawAccepted, setLawAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [cif, setCif] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [estimatedMembers, setEstimatedMembers] = useState('');
  
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
      toast(language === 'en' ? 'You must accept the RD 1054/2022 regulations' : 'Debes aceptar la normativa RD 1054/2022', 'error');
      return;
    }

    if (!companyName) {
      toast(language === 'en' ? 'Entity name is required' : 'El nombre de la entidad es obligatorio', 'error');
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
          is_business: true,
          company_name: companyName,
          platform_role: 'tenant_admin',
          is_partner_reg: true,
          plan_id: null,
          tenant_slug: null,
          nif_cif: cif,
          phone,
          address,
          province,
          estimated_members: estimatedMembers
        }
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(language === 'en' ? 'Check your email to confirm.' : 'Confirma tu email para configurar tu entidad.', 'success');
      router.push('/signup/success');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 p-4 min-h-screen pt-24 pb-12">
      <GlassCard className="flex flex-col items-center w-full p-8 sm:p-10 relative overflow-hidden border-indigo-500/20">
        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-300" />
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
          <Building2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter text-white italic">
          Registro de Partner
        </h1>
        <p className="text-indigo-400 mb-8 text-center text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/20">
          Entidades y Cooperativas
        </p>

        <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="text" 
              placeholder="Nombre" 
              icon={<User className="w-5 h-5" />}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border-indigo-500/20"
            />
            <Input 
              type="text" 
              placeholder="Apellidos" 
              icon={<User className="w-5 h-5" />}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="border-indigo-500/20"
            />
          </div>

          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder="Nombre de la Entidad / Cooperativa" 
              icon={<Hexagon className="w-5 h-5" />}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="border-indigo-500/20"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="text" 
                placeholder="CIF / NIF" 
                icon={<Building2 className="w-5 h-5" />}
                value={cif}
                onChange={(e) => setCif(e.target.value)}
                required
                className="border-indigo-500/20"
              />
              <Input 
                type="tel" 
                placeholder="Teléfono" 
                icon={<Phone className="w-5 h-5" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-indigo-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="text" 
                placeholder="Provincia" 
                icon={<MapPin className="w-5 h-5" />}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="border-indigo-500/20"
              />
              <Input 
                type="number" 
                placeholder="Nº estimado de socios" 
                icon={<Users className="w-5 h-5" />}
                value={estimatedMembers}
                onChange={(e) => setEstimatedMembers(e.target.value)}
                className="border-indigo-500/20"
              />
            </div>
          </div>

          <Input 
            type="email" 
            placeholder="Email de Administración" 
            icon={<Mail className="w-5 h-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-indigo-500/20"
          />
          <Input 
            type="password" 
            placeholder="Crear Contraseña" 
            icon={<Lock className="w-5 h-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-indigo-500/20"
          />
          
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" 
                id="privacy" 
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 focus:ring-current/50 cursor-pointer"
                required
              />
              <label htmlFor="privacy" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
                Acepto la <Link href="/privacy-policy" className="text-indigo-400 hover:underline" target="_blank">Política de Privacidad</Link>
              </label>
            </div>

            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" 
                id="legislation" 
                checked={lawAccepted}
                onChange={(e) => setLawAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 focus:ring-current/50 cursor-pointer"
                required
              />
              <label htmlFor="legislation" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
                Acepto la normativa <span className="text-white">RD 1054/2022</span> y <Link href="/partner-policy" className="text-indigo-400 hover:underline">legislaciones específicas</Link>.
              </label>
            </div>
          </div>
          
          <GlowButton 
            type="submit" 
            isLoading={loading} 
            className="w-full mt-4 text-lg py-6 font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
          >
            REGISTRAR ENTIDAD GRATIS
          </GlowButton>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs">
          <span className="text-white/30 uppercase font-black">
            ¿Ya sois partners?
          </span>
          <Link href="/partner/login" className="font-bold hover:underline text-indigo-400">
            Inicia Sesión aquí
          </Link>
        </div>
      </GlassCard>

      <footer className="w-full text-center py-6 mt-12 border-t border-white/5 flex flex-col gap-2 max-w-2xl mx-auto">
        <p className="text-[10px] text-gray-500">
          {language === 'en'
            ? `© 2026 INAGROSOLUTIONS. All rights reserved.`
            : `© 2026 INAGROSOLUTIONS. Todos los derechos reservados.`}
        </p>
        <div className="flex items-center justify-center gap-4 text-[9px] text-gray-600">
          <Link href="/privacy-policy" className="hover:text-indigo-400 transition-colors">{t('gdpr.privacyPolicy')}</Link>
          <Link href="/cookie-policy" className="hover:text-indigo-400 transition-colors">{t('gdpr.cookiePolicy')}</Link>
          <Link href="/legal-notice" className="hover:text-indigo-400 transition-colors">{t('gdpr.legalNotice')}</Link>
          <Link href="/partner-policy" className="hover:text-indigo-400 transition-colors font-bold uppercase tracking-tighter">Política de Partners</Link>
        </div>
      </footer>
    </div>
  );
}

export default function PartnerSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PartnerSignupContent />
    </Suspense>
  );
}
