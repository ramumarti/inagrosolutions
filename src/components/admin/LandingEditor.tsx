'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { Save, Layout, CreditCard, Star, FileText, Plus, Trash2 } from 'lucide-react';
import { saveSiteConfig, getSiteTestimonials, saveSiteTestimonial, deleteSiteTestimonial } from '@/lib/actions/site-config';
import { useToast } from '@/components/ui/Toast';

export default function LandingEditor({ initialConfig }: { initialConfig: Record<string, any> }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Hero section config
  const defaultHero = initialConfig.hero || {};
  const [heroTitle, setHeroTitle] = useState(defaultHero.title || 'Digitaliza tu rentabilidad agrícola');
  const [heroSubtitle, setHeroSubtitle] = useState(defaultHero.subtitle || 'La plataforma B2B/B2C líder para cuadernos de campo SIEX, control de inventario y trazabilidad financiera de tus parcelas.');
  
  // Pricing config
  const defaultPricing = initialConfig.pricing || {};
  const [pricingTitle, setPricingTitle] = useState(defaultPricing.title || 'Planes adaptados a ti');
  const [pricingBasic, setPricingBasic] = useState(defaultPricing.basic || { price: 15, features: 'Básico,SIEX' });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    const data = await getSiteTestimonials();
    setTestimonials(data);
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hero') {
        await saveSiteConfig('hero', 'title', heroTitle);
        await saveSiteConfig('hero', 'subtitle', heroSubtitle);
      } else if (activeTab === 'pricing') {
         await saveSiteConfig('pricing', 'title', pricingTitle);
         await saveSiteConfig('pricing', 'basic', pricingBasic);
      } else if (activeTab === 'testimonials') {
        // Testimonials are saved individually as modified
      }
      toast('Configuración guardada con éxito', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const addTestimonial = async () => {
    const newT = {
      author_name: 'Nombre del Cliente',
      author_role: 'Agricultor / Técnico',
      content: 'Escribe aquí la reseña...',
      sort_order: testimonials.length,
      is_active: true
    };
    const res = await saveSiteTestimonial(newT);
    if (res.success) fetchTestimonials();
  };

  const updateTestimonial = async (id: string, updates: any) => {
    await saveSiteTestimonial({ id, ...updates });
    fetchTestimonials();
  };

  const removeTestimonial = async (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este testimonio?')) {
      await deleteSiteTestimonial(id);
      fetchTestimonials();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <header>
          <h1 className="text-3xl font-black mb-2 glow-text flex items-center gap-3">
             <Layout className="text-[var(--color-primary)]" />
             Editor de la Landing Principal
          </h1>
          <p className="text-white/60">Modifica los textos públicos, beneficios y precios que ven los agricultores en la portada.</p>
       </header>

       <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto whitespace-nowrap">
          <button onClick={() => setActiveTab('hero')} className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'hero' ? 'bg-white/10 text-[var(--color-primary)] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/50 hover:text-white/80'}`}>
            <FileText size={16} /> Hero & Textos
          </button>
          <button onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'testimonials' ? 'bg-white/10 text-[var(--color-primary)] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/50 hover:text-white/80'}`}>
            <Star size={16} /> Testimonios
          </button>
          <button onClick={() => setActiveTab('pricing')} className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'pricing' ? 'bg-white/10 text-[var(--color-primary)] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-white/50 hover:text-white/80'}`}>
            <CreditCard size={16} /> Precios
          </button>
       </div>

       <GlassCard className="p-8">
         {activeTab === 'hero' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70">Título Principal (H1)</label>
                <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70">Subtítulo Descriptivo</label>
                <textarea 
                  value={heroSubtitle} 
                  onChange={e => setHeroSubtitle(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[var(--color-primary)] text-white/90 min-h-[100px]"
                />
              </div>
           </div>
         )}

         {activeTab === 'testimonials' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">Reseñas Publicadas</p>
                <button onClick={addTestimonial} className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 transition-all">
                  <Plus size={14} /> Nueva Reseña
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {testimonials.map((t) => (
                   <div key={t.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <Input value={t.author_name} onBlur={(e) => updateTestimonial(t.id, { author_name: e.target.value })} placeholder="Nombre Autor" className="bg-transparent" />
                          <Input value={t.author_role} onBlur={(e) => updateTestimonial(t.id, { author_role: e.target.value })} placeholder="Cargo / Entidad" className="bg-transparent text-[10px]" />
                        </div>
                        <button onClick={() => removeTestimonial(t.id)} className="p-2 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea 
                        defaultValue={t.content} 
                        onBlur={(e) => updateTestimonial(t.id, { content: e.target.value })}
                        placeholder="Contenido..."
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-white/60 focus:outline-none focus:border-emerald-500/30 font-medium italic"
                      />
                   </div>
                 ))}
              </div>
           </div>
         )}
         
         {activeTab === 'pricing' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/70">Título de la Sección Precios</label>
                <Input value={pricingTitle} onChange={e => setPricingTitle(e.target.value)} />
              </div>
              <hr className="border-white/10 my-4" />
              <h3 className="font-bold text-white glow-text">Plan Básico</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Precio Mensual (€)</label>
                  <Input type="number" value={pricingBasic.price} onChange={e => setPricingBasic({...pricingBasic, price: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Features (separado por comas)</label>
                  <Input value={pricingBasic.features} onChange={e => setPricingBasic({...pricingBasic, features: e.target.value})} />
                 </div>
               </div>
           </div>
         )}

         {activeTab !== 'testimonials' && (
           <div className="mt-8 flex justify-end">
              <GlowButton onClick={handleSave} isLoading={loading}>
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </GlowButton>
           </div>
         )}
       </GlassCard>
    </div>
  )
}
