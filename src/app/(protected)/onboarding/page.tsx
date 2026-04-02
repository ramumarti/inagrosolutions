'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { TIER_CONFIG, suggestTier } from '@/lib/modules';
import type { AgriTier } from '@/lib/modules';
import { 
  User, Globe, Shield, ChevronRight, ChevronLeft, 
  Check, Lock, Rocket, Target, Zap, Leaf, MapPin,
  Crown, Sparkles
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

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

  // Step 2: Explotación
  const [explotacion, setExplotacion] = useState({
    nombre: '', num_registro_siex: '', total_hectareas: ''
  });

  // Step 3: Nivel / Tier
  const [selectedTier, setSelectedTier] = useState<AgriTier>('basico');

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

  // Auto-suggest tier when hectares change
  useEffect(() => {
    if (explotacion.total_hectareas) {
      setSelectedTier(suggestTier(Number(explotacion.total_hectareas)));
    }
  }, [explotacion.total_hectareas]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { 
          first_name: perfil.first_name, 
          last_name: perfil.last_name,
          onboarded: true,
          empresa: perfil.empresa
        }
      });

      // Create explotación
      const { data: explotacionData } = await supabase.from('explotaciones').insert({
        user_id: userId,
        nombre: explotacion.nombre || `Explotación de ${perfil.first_name}`,
        num_registro_siex: explotacion.num_registro_siex || null,
        total_hectareas: Number(explotacion.total_hectareas) || 0,
      }).select().single();

      // Update user tier
      const defaultModules = ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas', 'exportacion'];
      if (selectedTier === 'intermedio') defaultModules.push('costes', 'cosechas', 'alertas');
      if (selectedTier === 'avanzado') defaultModules.push('costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards');
      if (selectedTier === 'premium') defaultModules.push('costes', 'cosechas', 'alertas', 'trazabilidad', 'dashboards', 'sensores');

      await supabase.from('users').update({
        agri_tier: selectedTier,
        total_hectareas: Number(explotacion.total_hectareas) || 0,
        modulos_activos: defaultModules,
        onboarded_agri: true,
      }).eq('id', userId);

      router.push('/cuaderno');
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('Error al guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: 'Perfil', icon: User },
    { num: 2, label: 'Explotación', icon: MapPin },
    { num: 3, label: 'Plan', icon: Crown },
    { num: 4, label: 'Lanzar', icon: Rocket },
  ];

  const tiers: AgriTier[] = ['basico', 'intermedio', 'avanzado', 'premium'];

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/15";

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 md:p-12 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl space-y-10 relative z-10">

        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <Leaf size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Cuaderno Digital • Configuración Inicial</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Configura tu Explotación</h1>
           <p className="text-white/30 text-sm font-medium">Tu cuaderno de campo digital, listo en 2 minutos</p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-center gap-3">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-emerald-400' : 'text-white/10'}`}>
                 <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                   step === s.num ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                   step > s.num ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10'
                 }`}>
                    {step > s.num ? <Check size={18} /> : <s.icon size={18} />}
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-[2px] rounded-full mt-[-20px] ${step > s.num ? 'bg-emerald-500' : 'bg-white/5'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card Content */}
        <GlassCard className="p-8 md:p-10 border-white/10 shadow-2xl relative overflow-hidden">
           {step === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-black text-white mb-2">¿Quién eres?</h2>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre</label>
                      <input className={inputClass} value={perfil.first_name} onChange={e => setPerfil({...perfil, first_name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Apellidos</label>
                      <input className={inputClass} value={perfil.last_name} onChange={e => setPerfil({...perfil, last_name: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Empresa / Cooperativa (opcional)</label>
                   <input className={inputClass} placeholder="Ej: Cooperativa del Valle" value={perfil.empresa} onChange={e => setPerfil({...perfil, empresa: e.target.value})} />
                </div>
                <div className="pt-2">
                   <GlowButton variant="primary" className="w-full py-5 rounded-2xl text-[11px]" onClick={() => setStep(2)}>
                      Continuar <ChevronRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg font-black text-white mb-2">Tu Explotación</h2>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre de la Explotación *</label>
                      <input className={inputClass} placeholder="Ej: Finca Los Olivos" value={explotacion.nombre} onChange={e => setExplotacion({...explotacion, nombre: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nº Registro SIEX</label>
                         <input className={inputClass} placeholder="Opcional" value={explotacion.num_registro_siex} onChange={e => setExplotacion({...explotacion, num_registro_siex: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Hectáreas *</label>
                         <input type="number" step="0.1" className={inputClass} placeholder="0.0" value={explotacion.total_hectareas} onChange={e => setExplotacion({...explotacion, total_hectareas: e.target.value})} />
                      </div>
                   </div>
                </div>
                <div className="pt-2 flex gap-4">
                   <GlowButton variant="secondary" className="flex-1 py-5 rounded-2xl text-[11px]" onClick={() => setStep(1)}>
                      <ChevronLeft size={16} className="mr-2" /> Atrás
                   </GlowButton>
                   <GlowButton variant="primary" className="flex-[2] py-5 rounded-2xl text-[11px]" onClick={() => setStep(3)} disabled={!explotacion.nombre}>
                      Siguiente <ChevronRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-lg font-black text-white mb-1">Selecciona tu Plan</h2>
                  <p className="text-xs text-white/30">
                    {explotacion.total_hectareas 
                      ? `Con ${explotacion.total_hectareas} ha te recomendamos el plan ${TIER_CONFIG[suggestTier(Number(explotacion.total_hectareas))].label_es}`
                      : 'Todos los módulos legales incluidos desde el primer día'
                    }
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {tiers.map(tier => {
                    const info = TIER_CONFIG[tier];
                    const recommended = explotacion.total_hectareas ? suggestTier(Number(explotacion.total_hectareas)) === tier : tier === 'basico';
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`relative p-5 rounded-xl border text-left transition-all ${
                          selectedTier === tier
                            ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        {recommended && (
                          <div className="absolute -top-2 right-3 px-2 py-0.5 bg-emerald-500 rounded text-[7px] font-black text-black uppercase tracking-widest">
                            Recomendado
                          </div>
                        )}
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white text-xs font-black mb-3`}>
                          {info.label_es[0]}
                        </div>
                        <p className="font-black text-white text-sm mb-0.5">{info.label_es}</p>
                        <p className="text-[9px] text-white/30 font-bold">
                          {info.price_monthly === 0 ? 'Gratis' : `${info.price_monthly.toString().replace('.', ',')} €/mes`} • {info.max_ha === Infinity ? '> 100' : `≤${info.max_ha}`} ha
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 flex gap-4">
                   <GlowButton variant="secondary" className="flex-1 py-5 rounded-2xl text-[11px]" onClick={() => setStep(2)}>
                      <ChevronLeft size={16} className="mr-2" /> Atrás
                   </GlowButton>
                   <GlowButton variant="primary" className="flex-[2] py-5 rounded-2xl text-[11px]" onClick={() => setStep(4)}>
                      Confirmar <ChevronRight size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}

           {step === 4 && (
             <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto shadow-2xl">
                   <Rocket size={40} className="animate-bounce" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white mb-2">¡Tu Cuaderno Digital está Listo!</h2>
                   <p className="text-sm text-white/40">
                     {explotacion.nombre} • {explotacion.total_hectareas || '0'} ha • Plan {TIER_CONFIG[selectedTier].label_es}
                   </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['SIEX', 'Fitosanitarios', 'Fertilización', 'Labores', 'Parcelas', 'Exportación PAC'].map(mod => (
                    <span key={mod} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      ✓ {mod}
                    </span>
                  ))}
                </div>
                <div className="pt-4">
                   <GlowButton variant="primary" className="w-full py-5 rounded-2xl text-[11px] shadow-[0_0_40px_rgba(16,185,129,0.3)]" onClick={handleFinish} isLoading={saving}>
                      Abrir Cuaderno Digital <Sparkles size={16} className="ml-2" />
                   </GlowButton>
                </div>
             </div>
           )}
        </GlassCard>

        {/* Footer */}
        <div className="flex justify-center gap-8 opacity-20 text-[9px] font-black uppercase tracking-[0.3em] text-white">
           <span className="flex items-center gap-1"><Lock size={10} /> Encriptado</span>
           <span className="flex items-center gap-1"><Globe size={10} /> Cloud GDPR</span>
           <span className="flex items-center gap-1"><Shield size={10} /> SIEX Ready</span>
        </div>

      </div>
    </div>
  );
}
