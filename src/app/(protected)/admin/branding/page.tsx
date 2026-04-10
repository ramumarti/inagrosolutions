"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { createClient } from '@/lib/supabase/client';
import { Palette, Upload, Eye, Save, Globe, Eraser } from 'lucide-react';

export default function BrandingPage() {
  const { tenant, loading: profileLoading, refreshProfile } = useAgriProfile();
  const { t, language } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#065F46');
  const [logoUrl, setLogoUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [loading, setLoading] = useState(false);

  // Safety timeout to prevent infinite loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profileLoading) {
        console.warn("Branding page loading taking too long, forcing visible state.");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [profileLoading]);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setPrimaryColor(tenant.primary_color || '#10B981');
      setSecondaryColor(tenant.secondary_color || '#065F46');
      setLogoUrl(tenant.logo_url || '');
      setCustomDomain(tenant.custom_domain || '');
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenant) {
      toast(language === 'en' ? 'No tenant context found.' : 'No se ha encontrado el contexto de empresa.', 'error');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('tenants')
      .update({
        name,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        custom_domain: customDomain,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.id);

    setLoading(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast(language === 'en' ? 'Branding updated successfully' : 'Marca actualizada correctamente', 'success');
      if (refreshProfile) refreshProfile();
      // Apply CSS variables instantly to the root
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      if (secondaryColor) document.documentElement.style.setProperty('--color-accent-blue', secondaryColor);
    }
  };

  const resetColors = () => {
    setPrimaryColor('#10B981');
    setSecondaryColor('#065F46');
  };

  // If loading persists more than 3s, we show the form anyway to avoid "blank" sensation
  if (profileLoading && !tenant) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 font-medium animate-pulse">Sincronizando Identidad Corporativa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold glow-text flex items-center gap-3">
          <Palette className="w-8 h-8 text-[var(--color-primary)]" />
          {language === 'en' ? 'White Label & Branding' : 'Marca Blanca y Personalización'}
        </h1>
        <p className="text-white/60">
          {language === 'en' 
            ? 'Configure how your company appears to your farmers and technicians.' 
            : 'Configura cómo aparece tu empresa ante tus agricultores y técnicos.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />
              {language === 'en' ? 'General Identity' : 'Identidad General'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Company Name' : 'Nombre de la Empresa'}</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={language === 'en' ? 'Enter company name' : 'Nombre de la cooperativa'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Custom Domain' : 'Dominio Personalizado'}</label>
                <Input 
                  value={customDomain} 
                  onChange={(e) => setCustomDomain(e.target.value)} 
                  placeholder="portal.tucooperativa.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Company Logo' : 'Logo de la Empresa'}</label>
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-[var(--color-primary)] transition-all group relative overflow-hidden">
                {logoUrl ? (
                  <div className="relative group/logo w-32 h-32 flex items-center justify-center bg-white/5 rounded-xl overflow-hidden border border-white/10">
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                    <button 
                      onClick={() => setLogoUrl('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <Eraser size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
                    <Upload size={40} />
                  </div>
                )}
                
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-white/40 leading-relaxed">
                    {language === 'en' 
                      ? 'Format: PNG, SVG or WebP. Recommend transparent background.' 
                      : 'Formato: PNG, SVG o WebP. Recomendamos fondo transparente (PNG).'}
                  </p>
                  <label className="inline-block cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !tenant) return;
                        setLoading(true);
                        
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${tenant.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                          const filePath = `logos/${fileName}`;
                          
                          const { error: uploadError } = await supabase.storage
                            .from('branding')
                            .upload(filePath, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('branding')
                            .getPublicUrl(filePath);

                          setLogoUrl(publicUrl);
                          toast(language === 'en' ? 'Logo uploaded' : 'Logo subido con éxito', 'success');
                        } catch (err: any) {
                          toast(err.message, 'error');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                    <div className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                      <Upload size={14} />
                      {language === 'en' ? 'Choose Image' : 'Seleccionar Imagen'}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-white/10 my-6" />

            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[var(--color-primary)]" />
              {language === 'en' ? 'Color Palette' : 'Paleta de Colores'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Primary Color' : 'Color Primario'}</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <code className="bg-white/5 px-3 py-1 rounded text-sm">{primaryColor}</code>
                </div>
                <p className="text-xs text-white/40 italic">
                  {language === 'en' ? 'Used for buttons, links, and main highlights.' : 'Usado para botones, enlaces y destacados principales.'}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Secondary Color' : 'Color Secundario'}</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <code className="bg-white/5 px-3 py-1 rounded text-sm">{secondaryColor}</code>
                </div>
                <p className="text-xs text-white/40 italic">
                  {language === 'en' ? 'Used for backgrounds and secondary elements.' : 'Usado para fondos y elementos secundarios.'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button 
                onClick={resetColors}
                className="text-white/40 hover:text-white flex items-center gap-2 text-sm transition-colors"
                type="button"
              >
                <Eraser className="w-4 h-4" />
                {language === 'en' ? 'Reset to default' : 'Restablecer valores'}
              </button>
              
              <GlowButton 
                onClick={handleSave} 
                isLoading={loading}
                icon={<Save className="w-4 h-4" />}
              >
                {t('common.save')}
              </GlowButton>
            </div>
          </GlassCard>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 px-2">
            <Eye className="w-5 h-5 text-[var(--color-primary)]" />
            {language === 'en' ? 'Live Preview' : 'Vista Previa'}
          </h2>
          
          <div className="sticky top-8 space-y-4">
            <GlassCard className="p-6 border-2" style={{ borderColor: primaryColor }}>
              <div className="flex items-center gap-4 mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded bg-white/10 animate-pulse" />
                )}
                <span className="font-bold text-lg">{name || 'Nombre Cooperativa'}</span>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                
                <button 
                  className="w-full py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}44` }}
                >
                  {language === 'en' ? 'Sample Button' : 'Botón de Ejemplo'}
                </button>
              </div>
            </GlassCard>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 text-center italic">
              {language === 'en' 
                ? 'Your farmers will see this style when they log in.' 
                : 'Tus agricultores verán este estilo al iniciar sesión.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
