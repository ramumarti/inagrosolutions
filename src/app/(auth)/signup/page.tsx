"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Hexagon, User, Building2, Leaf, ChevronLeft, Phone, MapPin, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan');
  const tenantSlug = searchParams?.get('tenant');
  const roleParam = searchParams?.get('role'); // New parameter

  const [mode, setMode] = useState<'select' | 'farmer' | 'partner' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lawAccepted, setLawAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Partner specific fields
  const [cif, setCif] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [estimatedMembers, setEstimatedMembers] = useState('');
  
  const [tenant, setTenant] = useState<any>(null);

  // Determine initial mode from URL and Context
  useEffect(() => {
    if (roleParam === 'farmer' || plan || tenantSlug) {
      setMode('farmer');
    } else if (roleParam === 'partner') {
      setMode('partner');
    } else {
      setMode('select');
    }
    
    if (tenantSlug) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.from('tenants').select('*').eq('slug', tenantSlug).single().then(({ data }) => {
          if (data) setTenant(data);
        });
      });
    }
  }, [plan, tenantSlug, roleParam]);

  const isFarmer = mode === 'farmer';
  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : '';
  const primaryColor = tenant?.primary_color || '#10B981'; // emerald-500 default
  const logoUrl = tenant?.logo_url;
  
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
          platform_role: isFarmer ? 'farmer' : 'tenant_admin',
          is_partner_reg: !isFarmer,
          plan_id: isFarmer ? plan : null,
          tenant_slug: tenantSlug || null,
          ...( !isFarmer ? { nif_cif: cif, phone, address, province, estimated_members: estimatedMembers } : {} )
        }
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      const successTitle = language === 'en' ? 'Account Created!' : '¡Cuenta Creada!';
      const successMsg = language === 'en' 
        ? 'Check your email to confirm and proceed.' 
        : (isFarmer ? 'Confirma tu email ahora para proceder al pago seguro y activar tus servicios.' : 'Confirma tu email para configurar tu entidad y acceder al panel.');
      
      toast(successMsg, 'success');
      
      router.push(!isFarmer ? '/signup/success' : '/login?msg=awaiting-confirmation');
    }
  };

  if (mode === 'select') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto relative z-10 p-4 min-h-screen">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
            Bienvenido a <span className="text-emerald-400">Inagro</span>Solutions
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Selecciona tu tipo de perfil para continuar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Opción Agricultor */}
          <button 
            onClick={() => setMode('farmer')}
            className="group relative flex flex-col items-center p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 text-center"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity" />
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform">
              <Leaf className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Soy Agricultor</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Gestiona tu Cuaderno Digital (CUE/SIEX), parcelas, tratamientos y exportaciones oficiales de forma sencilla.
            </p>
            <div className="mt-auto py-3 px-6 bg-white/5 rounded-xl border border-white/10 group-hover:bg-emerald-500 group-hover:text-black font-black text-xs uppercase tracking-widest transition-all">
              Crear mi Explotación
            </div>
          </button>

          {/* Opción Partner */}
          <button 
            onClick={() => setMode('partner')}
            className="group relative flex flex-col items-center p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500 text-center"
          >
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity" />
            <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform">
              <Building2 className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Soy Partner / Cooperativa</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Gestiona cientos de cuadernos, supervisa técnicos y ofrece un servicio digital avanzado a tus socios.
            </p>
            <div className="mt-auto py-3 px-6 bg-white/5 rounded-xl border border-white/10 group-hover:bg-indigo-500 group-hover:text-white font-black text-xs uppercase tracking-widest transition-all">
              Registrar mi Entidad
            </div>
          </button>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Software de Gestión Agrícola • SIEX Ready</p>
          <div className="flex items-center justify-center gap-6 opacity-30">
             <Link href="/login" className="text-xs font-bold text-white hover:text-emerald-400 transition-colors uppercase tracking-widest">¿Ya tienes cuenta? Inicia Sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 p-4 min-h-screen pt-24 pb-12">
      <div className="w-full mb-6">
        <button 
          onClick={() => setMode('select')}
          className="flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-3 h-3" /> Volver a selección
        </button>
      </div>
      
      <GlassCard className="flex flex-col items-center w-full p-8 sm:p-10 relative overflow-hidden">
        {isFarmer ? (
          <>
            <div className="absolute top-0 w-full h-1.5" style={{ background: `linear-gradient(to right, ${primaryColor}, transparent)` }} />
            {logoUrl ? (
              <div className="mb-6 p-2 bg-white/10 rounded-xl border border-white/5 backdrop-blur-md shadow-lg">
                <img src={logoUrl} alt="Logo Entidad" className="h-12 object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border" style={{ backgroundColor: `${primaryColor}33`, borderColor: `${primaryColor}4D`, boxShadow: `0 0 20px ${primaryColor}33` }}>
                <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
            )}
            <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter text-white italic">
              Crea tu Explotación
            </h1>
            {plan && (
               <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest px-3 py-1 rounded border" style={{ color: primaryColor, backgroundColor: `${primaryColor}1A`, borderColor: `${primaryColor}33` }}>
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
              className={!isFarmer ? "border-indigo-500/20" : ""}
            />
            {!isFarmer && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="text" 
                    placeholder="CIF / NIF" 
                    icon={<Building2 className="w-5 h-5" />}
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                    required
                  />
                  <Input 
                    type="tel" 
                    placeholder="Teléfono" 
                    icon={<Phone className="w-5 h-5" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
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
                  />
                  <Input 
                    type="number" 
                    placeholder="Nº estimado de socios" 
                    icon={<Users className="w-5 h-5" />}
                    value={estimatedMembers}
                    onChange={(e) => setEstimatedMembers(e.target.value)}
                  />
                </div>
              </>
            )}
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
                className={`mt-1 w-4 h-4 rounded border-white/10 bg-white/5 focus:ring-current/50 cursor-pointer`}
                style={{ color: isFarmer ? primaryColor : undefined }}
                required
              />
              <label htmlFor="privacy" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
                Acepto la <Link href="/privacy-policy" className={`hover:underline ${!isFarmer && 'text-indigo-400'}`} style={isFarmer ? { color: primaryColor } : {}} target="_blank">Política de Privacidad {(isFarmer && tenant?.name) ? `de ${tenant.name}` : ''}</Link>
              </label>
            </div>

            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" 
                id="legislation" 
                checked={lawAccepted}
                onChange={(e) => setLawAccepted(e.target.checked)}
                className={`mt-1 w-4 h-4 rounded border-white/10 bg-white/5 focus:ring-current/50 cursor-pointer`}
                style={{ color: isFarmer ? primaryColor : undefined }}
                required
              />
              <label htmlFor="legislation" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight">
                {isFarmer ? (
                  <>Acepto las condiciones del <span className="text-white">Cuaderno SIEX</span> y la exención de responsabilidad {(isFarmer && tenant?.name) ? `de ${tenant.name}` : ''}.</>
                ) : (
                  <>Acepto la normativa <span className="text-white">RD 1054/2022</span> y <Link href="/partner-policy" className="text-indigo-400 hover:underline">legislaciones específicas</Link>.</>
                )}
              </label>
            </div>
          </div>
          
          <GlowButton 
            type="submit" 
            isLoading={loading} 
            className={`w-full mt-4 text-lg py-6 font-black uppercase tracking-widest ${!isFarmer && 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'}`}
            style={isFarmer ? { backgroundColor: primaryColor, color: '#000', boxShadow: `0 0 20px ${primaryColor}33` } : {}}
          >
            {isFarmer ? 'CREAR MI CUENTA' : 'REGISTRAR ENTIDAD GRATIS'}
          </GlowButton>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs">
          <span className="text-white/30 uppercase font-black">
            {isFarmer ? '¿Ya tienes cuenta?' : '¿Ya sois partners?'}
          </span>
          <Link href="/login" className={`font-bold hover:underline ${!isFarmer && 'text-indigo-400'}`} style={isFarmer ? { color: primaryColor } : {}}>
            Inicia Sesión aquí
          </Link>
        </div>
      </GlassCard>

      {/* Dynamic Footer */}
      <footer className="w-full text-center py-6 mt-12 border-t border-white/5 flex flex-col gap-2 max-w-2xl mx-auto">
        <p className="text-[10px] text-gray-500">
          {language === 'en'
            ? `© 2026 ${tenant?.name || 'INAGROSOLUTIONS'}. All rights reserved.`
            : `© 2026 ${tenant?.name || 'INAGROSOLUTIONS'}. Todos los derechos reservados.`}
        </p>
        <div className="flex items-center justify-center gap-4 text-[9px] text-gray-600">
          <Link href="/privacy-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.privacyPolicy')}</Link>
          <Link href="/cookie-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.cookiePolicy')}</Link>
          <Link href="/legal-notice" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.legalNotice')}</Link>
          {!tenantSlug && <Link href="/partner-policy" className="hover:text-[var(--color-primary)] transition-colors font-bold uppercase tracking-tighter">Política de Partners</Link>}
        </div>
      </footer>
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
