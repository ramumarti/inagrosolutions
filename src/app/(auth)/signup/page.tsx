"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Leaf, Search, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

function FarmerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get('plan');
  const tenantSlug = searchParams.get('tenant');
  const billing = searchParams.get('billing');
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const { toast } = useToast();
  const supabase = createClient();

  // Automatically fetch tenant details if slug is in URL
  useEffect(() => {
    if (tenantSlug) {
      setLoading(true);
      supabase
        .from('tenants')
        .select('id, name, slug, logo_url, primary_color, privacy_policy_url')
        .eq('slug', tenantSlug.toLowerCase().trim())
        .single()
        .then(({ data, error }) => {
          setLoading(false);
          if (data && !error) {
            setTenant(data);
          }
        });
    }
  }, [tenantSlug, supabase]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setTenant(null);
    
    // Look up the tenant by slug (code)
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug, logo_url, primary_color, privacy_policy_url')
      .eq('slug', code.toLowerCase().trim())
      .single();
      
    setLoading(false);
    
    if (error || !data) {
      toast('No hemos encontrado ninguna entidad con ese código. Verifica el código proporcionado.', 'error');
    } else {
      setTenant(data);
      // Update URL to keep context
      router.replace(`/signup?tenant=${data.slug}${planSlug ? `&plan=${planSlug}` : ''}`);
    }
  };

  const handleFarmerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) {
      toast('Debes aceptar la política de privacidad para continuar.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          isBusiness: false,
          platformRole: 'farmer',
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          planId: planSlug || 'basico',
          billingInterval: billing === 'annual' ? 'year' : 'month'
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setLoading(false);
        toast(result.error || 'Error al completar el registro.', 'error');
        return;
      }

      // Auto sign-in on the client side since the account is pre-confirmed
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      setLoading(false);

      if (signInError) {
        toast('Cuenta creada con éxito. Por favor, inicia sesión con tus credenciales.', 'warning');
        router.push('/login');
      } else {
        toast('¡Registro completado con éxito!', 'success');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setLoading(false);
      toast(err.message || 'Error de conexión', 'error');
    }
  };

  const primaryColor = tenant?.primary_color || '#10B981';
  const finalPrivacyUrl = tenant?.privacy_policy_url || `/privacy-policy?tenant=${tenant?.slug || ''}`;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 p-4 min-h-screen pt-24 pb-12">
      <GlassCard className="flex flex-col items-center w-full p-8 sm:p-10 relative overflow-hidden">
        
        {tenant ? (
          <div className="absolute top-0 w-full h-1.5" style={{ background: `linear-gradient(to right, ${primaryColor}, transparent)` }} />
        ) : (
          <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-pink)]" />
        )}

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border" 
             style={{ 
               backgroundColor: tenant ? `${primaryColor}20` : 'rgba(0, 255, 102, 0.2)', 
               borderColor: tenant ? `${primaryColor}40` : 'rgba(0, 255, 102, 0.3)'
             }}>
          {tenant && tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 object-contain" />
          ) : (
            <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
          )}
        </div>
        
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter text-white italic">
          Registro de Agricultor
        </h1>

        {tenant ? (
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest text-center mb-6">
            Socio de: <span style={{ color: primaryColor }}>{tenant.name}</span>
          </p>
        ) : (
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-6">
            Cuaderno Digital de Campo
          </p>
        )}
        
        {!tenant ? (
          <>
            <p className="text-white/60 mb-8 text-center text-sm font-medium">
              Para registrarte en la plataforma, necesitas el <strong>Código de Entidad</strong> que te ha proporcionado tu cooperativa, técnico o asociación.
            </p>

            <form onSubmit={handleSearch} className="w-full flex flex-col gap-4">
              <Input 
                type="text" 
                placeholder="Ejemplo: mi-cooperativa" 
                icon={<Search className="w-5 h-5" />}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              
              <GlowButton 
                type="submit" 
                isLoading={loading} 
                className="w-full mt-2 text-lg py-6 font-black uppercase tracking-widest"
              >
                Buscar Entidad
              </GlowButton>
            </form>
          </>
        ) : (
          <form onSubmit={handleFarmerSignup} className="w-full flex flex-col gap-4 animate-fade-in">
            {planSlug && (
              <div className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-bold text-gray-400 mb-2">
                Plan Seleccionado: <span className="text-white uppercase">{planSlug}</span>
              </div>
            )}

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

            <Input 
              type="email" 
              placeholder="Tu correo electrónico" 
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

            {/* GDPR Checkbox */}
            <div className="flex items-start gap-3 px-1 mt-2">
              <input 
                type="checkbox" 
                id="privacy" 
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 focus:ring-current/50 cursor-pointer"
                required
              />
              <label htmlFor="privacy" className="text-[10px] text-white/50 cursor-pointer hover:text-white/70 transition-colors uppercase font-bold tracking-tight leading-normal">
                He leído y acepto la <Link href={finalPrivacyUrl} className="hover:underline font-bold" style={{ color: primaryColor }} target="_blank">Política de Privacidad</Link> de {tenant.name} y consiento el tratamiento de mis datos personales para la gestión de mi Cuaderno Digital.
              </label>
            </div>

            <GlowButton 
              type="submit" 
              isLoading={loading} 
              className="w-full mt-4 text-lg py-6 font-black uppercase tracking-widest"
              style={{ backgroundColor: primaryColor }}
            >
              Completar Registro
            </GlowButton>
            
            <button 
              type="button"
              onClick={() => { setTenant(null); setCode(''); router.replace('/signup'); }}
              className="mt-2 text-xs text-white/40 hover:text-white uppercase font-bold tracking-widest self-center"
            >
              Cambiar de Cooperativa
            </button>
          </form>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 text-xs w-full pt-6 border-t border-white/5">
          <span className="text-white/30 uppercase font-black">¿Ya tienes cuenta?</span>
          <Link href="/login" className="text-emerald-400 font-bold hover:underline uppercase flex items-center gap-1 mb-4">
            Inicia Sesión aquí
          </Link>
          <span className="text-white/30 uppercase font-black">¿Eres una Entidad/Partner?</span>
          <Link href="/partner/signup" className="text-indigo-400 font-bold hover:underline uppercase flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Registra tu Plataforma
          </Link>
        </div>
      </GlassCard>

      <footer className="w-full text-center py-6 mt-12 border-t border-white/5 flex flex-col gap-2 max-w-2xl mx-auto">
        <p className="text-[10px] text-gray-500">© 2026 INAGROSOLUTIONS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default function FarmerSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>}>
      <FarmerSignupContent />
    </Suspense>
  );
}
