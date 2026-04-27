'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { 
  Building2, Palette, Globe, Rocket, Check, ArrowRight, Upload
} from 'lucide-react';
import { completePartnerOnboarding } from '@/lib/actions/partner-onboarding';

type Step = 1 | 2;

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [tenantData, setTenantData] = useState({
    slug: '',
    primary_color: '#10B981',
    secondary_color: '#3B82F6',
    logo_url: '',
    public_description: 'Entidad de servicios agrícolas adaptada al Cuaderno Digital.'
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      
      const { data: userData } = await supabase.from('users').select('platform_role, tenant_id').eq('id', user.id).single();
      
      if (userData?.platform_role !== 'tenant_admin') {
        router.push('/dashboard');
        return;
      }

      if (userData?.tenant_id) {
        router.push('/dashboard');
        return;
      }

      // Pre-fill from metadata
      if (user.user_metadata?.company_name) {
        setTenantData(prev => ({
          ...prev,
          slug: generateSlug(user.user_metadata.company_name)
        }));
      }
    }
    loadUser();
  }, [supabase, router]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await completePartnerOnboarding({
        slug: tenantData.slug || `partner-${Date.now()}`,
        primary_color: tenantData.primary_color,
        secondary_color: tenantData.secondary_color,
        logo_url: tenantData.logo_url,
        public_description: tenantData.public_description
      });
      
      if (res?.success) {
        // Redirigir a conectar Stripe (Task 2.5) o al dashboard
        router.push('/admin/billing?onboarding=true');
      }
    } catch (err: any) {
      console.error('Onboarding error:', err);
      alert(err.message || 'Error al guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-white/10 backdrop-blur-sm hover:border-white/20";

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 md:p-12 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl space-y-10 relative z-10">
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
              <Building2 size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Onboarding de Entidad</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Configura tu Marca Blanca</h1>
           <p className="text-white/30 text-sm font-medium">Personaliza la experiencia para tus agricultores asociados</p>
        </div>

        <GlassCard className="p-8 md:p-10 border-white/10 shadow-2xl relative overflow-hidden">
           {step === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-black text-white mb-2">Identidad Corporativa</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Enlace personalizado (Slug)</label>
                    <div className="flex items-center">
                      <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-2xl px-4 py-4 text-white/40 text-sm">app.inagrosolutions.com/c/</span>
                      <input 
                        className={`${inputClass} rounded-l-none border-l-0 focus:ring-0`} 
                        placeholder="mi-cooperativa" 
                        value={tenantData.slug} 
                        onChange={e => setTenantData({...tenantData, slug: generateSlug(e.target.value)})} 
                      />
                    </div>
                    <p className="text-xs text-white/30">Tus agricultores se registrarán desde esta URL única.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Descripción Pública</label>
                    <textarea 
                      className={`${inputClass} min-h-[100px]`} 
                      placeholder="Breve descripción que verán tus agricultores en tu portal..." 
                      value={tenantData.public_description} 
                      onChange={e => setTenantData({...tenantData, public_description: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="pt-4">
                   <GlowButton onClick={() => setStep(2)} className="w-full py-5 rounded-2xl text-[11px] bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20 text-white font-bold uppercase tracking-widest">
                      Siguiente Paso <ArrowRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-black text-white mb-2">Apariencia y Colores</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Palette className="w-3 h-3"/> Color Principal</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        value={tenantData.primary_color} 
                        onChange={e => setTenantData({...tenantData, primary_color: e.target.value})}
                        className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                      />
                      <span className="text-white font-mono text-sm uppercase px-4 py-2 bg-white/5 rounded-lg border border-white/10">{tenantData.primary_color}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Upload className="w-3 h-3"/> Logotipo (URL)</label>
                    <input 
                      className={inputClass} 
                      placeholder="https://ejemplo.com/logo.png" 
                      value={tenantData.logo_url} 
                      onChange={e => setTenantData({...tenantData, logo_url: e.target.value})} 
                    />
                    <p className="text-[10px] text-white/30">Opcional. Se mostrará en tu landing page y en la app de tus agricultores.</p>
                  </div>
                </div>

                <div className="pt-6">
                   <GlowButton onClick={handleFinish} isLoading={saving} className="w-full py-5 rounded-2xl text-[11px] bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.3)] text-white font-bold uppercase tracking-widest">
                      Finalizar Configuración <Rocket size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}
        </GlassCard>
      </div>
    </div>
  );
}
