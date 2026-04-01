"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  User, MapPin, Sprout, ChevronRight, ChevronLeft, 
  Check, Leaf, Tractor, Plus, Trash2, ArrowRight
} from 'lucide-react';

type Step = 1 | 2 | 3;

interface ParcelForm {
  nombre: string;
  hectareas: string;
  cultivo: string;
  variedad: string;
  sistema_riego: string;
  referencia_sigpac: string;
}

const emptyParcel: ParcelForm = {
  nombre: '', hectareas: '', cultivo: 'Olivo', 
  variedad: '', sistema_riego: 'secano', referencia_sigpac: ''
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Step 1: Perfil
  const [perfil, setPerfil] = useState({
    first_name: '', last_name: '', dni: '', telefono: '', tipo: 'agricultor'
  });

  // Step 2: Explotación
  const [explotacion, setExplotacion] = useState({
    nombre: '', num_registro_siex: '', total_hectareas: ''
  });

  // Step 3: Parcelas
  const [parcelas, setParcelas] = useState<ParcelForm[]>([{ ...emptyParcel }]);

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

  const addParcela = () => setParcelas([...parcelas, { ...emptyParcel }]);
  
  const removeParcela = (index: number) => {
    if (parcelas.length <= 1) return;
    setParcelas(parcelas.filter((_, i) => i !== index));
  };

  const updateParcela = (index: number, field: keyof ParcelForm, value: string) => {
    const updated = [...parcelas];
    updated[index] = { ...updated[index], [field]: value };
    setParcelas(updated);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Update user profile
      await supabase.auth.updateUser({
        data: { first_name: perfil.first_name, last_name: perfil.last_name }
      });

      await supabase.from('users').update({
        first_name: perfil.first_name,
        last_name: perfil.last_name,
      }).eq('id', userId);

      // 2. Create explotación
      const { data: expData, error: expError } = await supabase
        .from('explotaciones')
        .insert({
          user_id: userId,
          nombre: explotacion.nombre,
          num_registro_siex: explotacion.num_registro_siex || null,
          total_hectareas: parseFloat(explotacion.total_hectareas) || 0,
        })
        .select('id')
        .single();

      if (expError) throw expError;

      // 3. Create parcelas
      const parcelRows = parcelas
        .filter(p => p.nombre.trim() !== '')
        .map(p => ({
          explotacion_id: expData.id,
          nombre: p.nombre,
          hectareas: parseFloat(p.hectareas) || 0,
          cultivo: p.cultivo || null,
          variedad: p.variedad || null,
          sistema_riego: p.sistema_riego || null,
          referencia_sigpac: p.referencia_sigpac || null,
        }));

      if (parcelRows.length > 0) {
        const { error: parError } = await supabase.from('parcelas').insert(parcelRows);
        if (parError) throw parError;
      }

      router.push('/');
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('Error al guardar los datos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const totalHa = parcelas.reduce((sum, p) => sum + (parseFloat(p.hectareas) || 0), 0);

  const steps = [
    { num: 1, label: 'Perfil', icon: User },
    { num: 2, label: 'Explotación', icon: MapPin },
    { num: 3, label: 'Parcelas', icon: Sprout },
  ];

  return (
    <div className="min-h-full flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 text-xs font-black uppercase tracking-[0.2em]">
            <Leaf className="w-3.5 h-3.5" />
            Configuración Inicial
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Configura tu explotación
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Necesitamos algunos datos para personalizar tu cuaderno digital y cumplir con la normativa SIEX.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => s.num <= step && setStep(s.num as Step)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  step === s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : step > s.num
                    ? 'bg-emerald-500/10 text-emerald-500/60 border border-emerald-500/10 cursor-pointer'
                    : 'bg-white/[0.02] text-white/20 border border-white/5'
                }`}
              >
                {step > s.num ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{s.num}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-[2px] rounded-full ${step > s.num ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <GlassCard className="p-8 md:p-10 border border-white/5">

          {/* Step 1: Perfil */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Datos del Titular</h2>
                <p className="text-white/30 text-xs">Información del responsable de la explotación.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nombre</label>
                  <input
                    value={perfil.first_name}
                    onChange={e => setPerfil({...perfil, first_name: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Apellidos</label>
                  <input
                    value={perfil.last_name}
                    onChange={e => setPerfil({...perfil, last_name: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    placeholder="Apellidos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DNI / NIF</label>
                  <input
                    value={perfil.dni}
                    onChange={e => setPerfil({...perfil, dni: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    placeholder="12345678A"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Teléfono</label>
                  <input
                    value={perfil.telefono}
                    onChange={e => setPerfil({...perfil, telefono: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tipo de Usuario</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'agricultor', label: 'Agricultor', icon: '🌱' },
                    { value: 'tecnico', label: 'Técnico', icon: '🔬' },
                    { value: 'empresa', label: 'Empresa', icon: '🏢' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPerfil({...perfil, tipo: opt.value})}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                        perfil.tipo === opt.value
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <GlowButton variant="primary" onClick={() => setStep(2)} className="px-8">
                  Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </div>
          )}

          {/* Step 2: Explotación */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Datos de Explotación</h2>
                <p className="text-white/30 text-xs">Información de tu explotación agraria para los registros SIEX.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nombre de la Explotación</label>
                  <input
                    value={explotacion.nombre}
                    onChange={e => setExplotacion({...explotacion, nombre: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                    placeholder="Ej: Olivares del Sur"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nº Registro SIEX <span className="text-white/20">(Opcional)</span></label>
                    <input
                      value={explotacion.num_registro_siex}
                      onChange={e => setExplotacion({...explotacion, num_registro_siex: e.target.value})}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      placeholder="ES-XX-XXXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Superficie Total (ha)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={explotacion.total_hectareas}
                      onChange={e => setExplotacion({...explotacion, total_hectareas: e.target.value})}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all"
                      placeholder="45.2"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <GlowButton variant="ghost" onClick={() => setStep(1)} className="px-6">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </GlowButton>
                <GlowButton variant="primary" onClick={() => setStep(3)} className="px-8" disabled={!explotacion.nombre}>
                  Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </div>
          )}

          {/* Step 3: Parcelas */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Registra tus Parcelas</h2>
                  <p className="text-white/30 text-xs">Añade las parcelas de tu explotación. Podrás añadir más después.</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-emerald-400">{totalHa.toFixed(1)}</span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">ha totales</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {parcelas.map((p, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-emerald-500/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-emerald-400/60 uppercase tracking-widest">
                        Parcela {i + 1}
                      </span>
                      {parcelas.length > 1 && (
                        <button onClick={() => removeParcela(i)} className="text-red-400/50 hover:text-red-400 p-1 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={p.nombre}
                        onChange={e => updateParcela(i, 'nombre', e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="Nombre (Ej: El Olivar)"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={p.hectareas}
                        onChange={e => updateParcela(i, 'hectareas', e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="Hectáreas"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={p.cultivo}
                        onChange={e => updateParcela(i, 'cultivo', e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                      >
                        <option value="Olivo">🫒 Olivo</option>
                        <option value="Almendro">🌰 Almendro</option>
                        <option value="Viña">🍇 Viña</option>
                        <option value="Cereal">🌾 Cereal</option>
                        <option value="Hortaliza">🥬 Hortaliza</option>
                        <option value="Frutal">🍑 Frutal</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <input
                        value={p.variedad}
                        onChange={e => updateParcela(i, 'variedad', e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="Variedad (Picual...)"
                      />
                      <select
                        value={p.sistema_riego}
                        onChange={e => updateParcela(i, 'sistema_riego', e.target.value)}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                      >
                        <option value="secano">Secano</option>
                        <option value="goteo">Goteo</option>
                        <option value="aspersion">Aspersión</option>
                        <option value="gravedad">Gravedad</option>
                      </select>
                    </div>
                    
                    <input
                      value={p.referencia_sigpac}
                      onChange={e => updateParcela(i, 'referencia_sigpac', e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Ref. SIGPAC (Opcional: Prov-Mun-Pol-Par-Rec)"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addParcela}
                className="w-full py-3 border-2 border-dashed border-white/10 hover:border-emerald-500/30 rounded-2xl text-xs font-bold text-white/30 hover:text-emerald-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Añadir otra parcela
              </button>

              <div className="pt-4 flex justify-between">
                <GlowButton variant="ghost" onClick={() => setStep(2)} className="px-6">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </GlowButton>
                <GlowButton 
                  variant="primary" 
                  onClick={handleFinish} 
                  isLoading={saving}
                  className="px-8"
                  disabled={parcelas.every(p => !p.nombre.trim())}
                >
                  Finalizar Configuración <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </div>
          )}

        </GlassCard>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
          <span>🔒 Datos Encriptados</span>
          <span>📋 Conforme SIEX</span>
          <span>🇪🇺 Servidor UE</span>
        </div>
      </div>
    </div>
  );
}
