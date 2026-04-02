'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  User, Globe, Shield, ChevronRight, ChevronLeft, 
  Check, Lock, Rocket, Target, ArrowRight, Zap
} from 'lucide-react';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Step 1: Perfil
  const [perfil, setPerfil] = useState({
    first_name: '', last_name: '', role: 'propietario', empresa: ''
  });

  // Step 2: Preferences
  const [prefs, setPrefs] = useState({
    timezone: 'Europe/Madrid', language: 'es', notifications: true
  });

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);
      setPerfil(prev => ({
        ...prev,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
      }));
    }
    loadUser();
  }, [supabase, router]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: { 
          first_name: perfil.first_name, 
          last_name: perfil.last_name,
          onboarded: true,
          empresa: perfil.empresa
        }
      });

      await supabase.from('profiles').upsert({
        id: userId,
        first_name: perfil.first_name,
        last_name: perfil.last_name,
        empresa: perfil.empresa,
        onboarded: true
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('Error al guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: 'Perfil', icon: User },
    { num: 2, label: 'Empresa', icon: Target },
    { num: 3, label: 'Finalizar', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 md:p-12 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Zap size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Activación de Cuenta</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Configura tu Espacio</h1>
           <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Personaliza IASOLUTIONS para tu equipo</p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-indigo-400' : 'text-white/10'}`}>
                 <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                   step === s.num ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                   step > s.num ? 'bg-indigo-500 text-black border-indigo-500' : 'bg-white/5 border-white/10'
                 }`}>
                    {step > s.num ? <Check size={18} /> : <s.icon size={18} />}
                 </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-[2px] rounded-full ${step > s.num ? 'bg-indigo-500' : 'bg-white/5'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card Content */}
        <GlassCard className="p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden">
           {step === 1 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        value={perfil.first_name} onChange={e => setPerfil({...perfil, first_name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Apellidos</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        value={perfil.last_name} onChange={e => setPerfil({...perfil, last_name: e.target.value})}
                      />
                   </div>
                </div>
                <div className="pt-4">
                   <GlowButton variant="primary" className="w-full py-5 rounded-2xl text-[11px]" onClick={() => setStep(2)}>
                      Continuar <ChevronRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre de la Empresa</label>
                   <input 
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-black uppercase tracking-tight"
                     placeholder="Ej: CORP S.A."
                     value={perfil.empresa} onChange={e => setPerfil({...perfil, empresa: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Tu Rol</label>
                   <div className="grid grid-cols-2 gap-3">
                      {['Admin', 'Editor', 'Analista', 'Visor'].map(role => (
                        <button 
                          key={role}
                          onClick={() => setPerfil({...perfil, role})}
                          className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            perfil.role === role ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-white/20'
                          }`}
                        >
                           {role}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="pt-4 flex gap-4">
                   <GlowButton variant="secondary" className="flex-1 py-5 rounded-2xl text-[11px]" onClick={() => setStep(1)}>
                      <ChevronLeft size={16} className="mr-2" /> Atrás
                   </GlowButton>
                   <GlowButton variant="primary" className="flex-[2] py-5 rounded-2xl text-[11px]" onClick={() => setStep(3)}>
                      Siguiente <ChevronRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-indigo-500/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-2xl">
                   <Rocket size={40} className="animate-bounce" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white mb-2">¡Todo Listo!</h2>
                   <p className="text-sm text-white/40 font-medium">Estamos configurando tu instancia empresarial.</p>
                </div>
                <div className="pt-6">
                   <GlowButton variant="primary" className="w-full py-5 rounded-2xl text-[11px] shadow-[0_0_40px_rgba(16,185,129,0.3)]" onClick={handleFinish}>
                      Lanzar Dashboard <Rocket size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}
        </GlassCard>

        {/* Footer info */}
        <div className="flex justify-center gap-8 opacity-20 text-[9px] font-black uppercase tracking-[0.3em] text-white">
           <span className="flex items-center gap-1"><Lock size={10} /> Encriptado</span>
           <span className="flex items-center gap-1"><Globe size={10} /> Cloud Global</span>
           <span className="flex items-center gap-1"><Shield size={10} /> GDPR Ready</span>
        </div>

      </div>
    </div>
  );
}
