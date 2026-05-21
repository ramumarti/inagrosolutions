"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { createClient } from '@/lib/supabase/client';
import { Palette, Upload, Eye, Save, Globe, Eraser, Blocks, ShieldCheck } from 'lucide-react';
import { updateTenantModules } from '@/lib/actions/tenant-settings';

const AVAILABLE_MODULES = [
  { id: 'core', label: 'Cuaderno Básico', description: 'Gestión de fincas y parcelas.' },
  { id: 'fitosanitarios', label: 'Tratamientos Fitosanitarios', description: 'Registro de aplicaciones y dosis.' },
  { id: 'fertilizacion', label: 'Fertilización', description: 'Control de abonos y nutrición del suelo.' },
  { id: 'labores', label: 'Labores y Trabajos', description: 'Gestión de horas de maquinaria y operarios.' },
  { id: 'cosechas', label: 'Cosechas y Producción', description: 'Albaranes y rendimientos de recolección.' },
];

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
  const [activeModules, setActiveModules] = useState<string[]>(['core']);
  const [loading, setLoading] = useState(false);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [publicDescription, setPublicDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [showPublicPage, setShowPublicPage] = useState(true);
  
  // Novedades RGPD
  const [legalNoticeUrl, setLegalNoticeUrl] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [termsUrl, setTermsUrl] = useState('');
  const [legalEmail, setLegalEmail] = useState('');
  const [dpoName, setDpoName] = useState('');
  
  const [origin, setOrigin] = useState('');

  // Safety timeout to prevent infinite loading screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
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
      setActiveModules(tenant.active_modules || ['core']);
      setHeroTitle(tenant.hero_title || '');
      setHeroSubtitle(tenant.hero_subtitle || '');
      setPublicDescription(tenant.public_description || '');
      setContactEmail(tenant.contact_email || '');
      setContactPhone(tenant.contact_phone || '');
      setAddress(tenant.address || '');
      const links = tenant.social_links as any || {};
      setSocialFacebook(links.facebook || '');
      setSocialTwitter(links.twitter || '');
      setSocialInstagram(links.instagram || '');
      setSocialLinkedin(links.linkedin || '');
      setShowPublicPage(tenant.show_public_page ?? true);
      setLegalNoticeUrl(tenant.legal_notice_url || '');
      setPrivacyPolicyUrl(tenant.privacy_policy_url || '');
      setTermsUrl(tenant.terms_url || '');
      setLegalEmail(tenant.legal_email || '');
      setDpoName(tenant.dpo_name || '');
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
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        public_description: publicDescription,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address: address,
        social_links: {
          facebook: socialFacebook,
          twitter: socialTwitter,
          instagram: socialInstagram,
          linkedin: socialLinkedin
        },
        show_public_page: showPublicPage,
        legal_notice_url: legalNoticeUrl,
        privacy_policy_url: privacyPolicyUrl,
        terms_url: termsUrl,
        legal_email: legalEmail,
        dpo_name: dpoName,
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

  const handleToggleModule = async (moduleId: string) => {
    const newModules = activeModules.includes(moduleId)
      ? activeModules.filter(id => id !== moduleId)
      : [...activeModules, moduleId];
    
    if (moduleId === 'core' && !newModules.includes('core')) return;

    setActiveModules(newModules);
    try {
      await updateTenantModules(newModules);
      toast(language === 'en' ? 'Modules updated' : 'Módulos actualizados', 'success');
    } catch(e) {
      console.error(e);
      toast(language === 'en' ? 'Error updating modules' : 'Error al actualizar módulos', 'error');
    }
  };

  const resetColors = () => {
    setPrimaryColor('#10B981');
    setSecondaryColor('#065F46');
  };

  // If loading persists more than 3s, we show the form anyway to avoid "blank" sensation
  if (profileLoading && !tenant) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-8 bg-black">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Sincronizando Identidad</h2>
            <p className="text-white/40 text-sm">Configurando tu nuevo espacio de trabajo. Esto solo tomará unos segundos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant && !profileLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-8 bg-black">
        <GlassCard className="p-10 text-center space-y-6 max-w-md border-red-500/20">
          <Blocks className="w-16 h-16 text-red-500 mx-auto opacity-50" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Configuración Pendiente</h1>
            <p className="text-white/50 text-sm">No hemos podido localizar tu cuenta de entidad. Por favor, intenta recargar la página o contacta con soporte si el problema persiste.</p>
          </div>
          <GlowButton onClick={() => window.location.reload()}>Recargar Portal</GlowButton>
        </GlassCard>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">{language === 'en' ? 'Custom Domain' : 'Dominio Personalizado'}</label>
                  <Input 
                    value={customDomain} 
                    onChange={(e) => setCustomDomain(e.target.value)} 
                    placeholder="cuadernodc.micooperativa.com"
                  />
                </div>
                
                {customDomain && customDomain.length > 3 && customDomain.includes('.') && (
                  <div className="p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                      <Globe className="w-4 h-4" /> 
                      Instrucciones de DNS
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Para conectar este subdominio, accede a tu proveedor de dominio (GoDaddy, nominalia, etc.) y crea el siguiente registro:
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border border-white/5 shadow-inner">
                       <div className="flex flex-col">
                         <span className="text-white/40 mb-1 font-semibold uppercase text-[10px]">Tipo</span>
                         <span className="font-mono font-bold" style={{ color: primaryColor }}>CNAME</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-white/40 mb-1 font-semibold uppercase text-[10px]">Nombre / Host</span>
                         <span className="font-mono text-white/90">{customDomain.split('.')[0]}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-white/40 mb-1 font-semibold uppercase text-[10px]">Destino / Valor</span>
                         <span className="font-mono text-white/90">cname.vercel-dns.com</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-white/40 italic">Nota: Los cambios en los registros DNS pueden tardar algunas horas en propagarse.</p>
                  </div>
                )}
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

            <hr className="border-white/10 my-6" />

            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              {language === 'en' ? 'Legal Compliance (GDPR)' : 'Cumplimiento Normativo (RGPD)'}
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-200">
                  {language === 'en' 
                    ? 'Important: To register farmers, you must provide your legal policies. If omitted, registrations will be blocked.' 
                    : 'Importante: Para poder captar socios, tu cooperativa debe enlazar sus políticas legales para asumir la responsabilidad de los datos. Si están vacíos, se bloqueará el registro de nuevos agricultores.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">URL Política de Privacidad</label>
                  <Input 
                    value={privacyPolicyUrl} 
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)} 
                    placeholder="https://tucooperativa.com/privacidad"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">URL Aviso Legal</label>
                  <Input 
                    value={legalNoticeUrl} 
                    onChange={(e) => setLegalNoticeUrl(e.target.value)} 
                    placeholder="https://tucooperativa.com/aviso-legal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">URL Términos y Condiciones</label>
                  <Input 
                    value={termsUrl} 
                    onChange={(e) => setTermsUrl(e.target.value)} 
                    placeholder="https://tucooperativa.com/terminos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Responsable / Delegado de Protección (DPO)</label>
                  <Input 
                    value={dpoName} 
                    onChange={(e) => setDpoName(e.target.value)} 
                    placeholder="Ej. Juan Pérez - Director Técnico"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Email Legal (RGPD)</label>
                  <Input 
                    value={legalEmail} 
                    onChange={(e) => setLegalEmail(e.target.value)} 
                    placeholder="rgpd@tucooperativa.com"
                  />
                </div>
              </div>
            </div>

            <hr className="border-white/10 my-6" />

            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[var(--color-primary)]" />
              {language === 'en' ? 'Public Landing Page' : 'Página Pública'}
            </h2>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="show_public"
                    checked={showPublicPage}
                    onChange={(e) => setShowPublicPage(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-[var(--color-primary)] hover:border-[var(--color-primary)]/50 focus:ring-0 cursor-pointer transition-colors"
                  />
                  <label htmlFor="show_public" className="font-medium text-sm text-white/80 cursor-pointer">
                    {language === 'en' ? 'Enable public landing page (/c/slug)' : 'Habilitar página pública corporativa'}
                  </label>
                </div>
                
                {showPublicPage && tenant?.slug && (
                  <a 
                    href={`/c/${tenant.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                  >
                    <Globe className="w-4 h-4" />
                    {language === 'en' ? 'View Public Page' : 'Ver Página Pública'}
                  </a>
                )}
              </div>

              {showPublicPage && (
                <div className="grid grid-cols-1 gap-6 p-6 rounded-xl bg-white/5 border border-white/10 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      {language === 'en' ? 'Hero Title' : 'Título Principal (Hero)'}
                    </label>
                    <Input 
                      value={heroTitle} 
                      onChange={(e) => setHeroTitle(e.target.value)} 
                      placeholder={language === 'en' ? 'Welcome to our cooperative' : 'Bienvenido a nuestra cooperativa'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      {language === 'en' ? 'Hero Subtitle' : 'Subtítulo Principal'}
                    </label>
                    <Input 
                      value={heroSubtitle} 
                      onChange={(e) => setHeroSubtitle(e.target.value)} 
                      placeholder={language === 'en' ? 'Digitize your field notebook...' : 'Digitaliza tu cuaderno de campo...'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      {language === 'en' ? 'About Us' : 'Sobre Nosotros'}
                    </label>
                    <textarea 
                      value={publicDescription} 
                      onChange={(e) => setPublicDescription(e.target.value)} 
                      placeholder={language === 'en' ? 'We are a cooperative with over 20 years of experience...' : 'Somos una cooperativa con más de 20 años de experiencia...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 min-h-[100px] resize-y text-white placeholder-white/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        {language === 'en' ? 'Contact Email' : 'Email de Contacto'}
                      </label>
                      <Input 
                        value={contactEmail} 
                        onChange={(e) => setContactEmail(e.target.value)} 
                        placeholder="info@cooperativa.es"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        {language === 'en' ? 'Contact Phone' : 'Teléfono de Contacto'}
                      </label>
                      <Input 
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)} 
                        placeholder="900 123 456"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-white/70">
                         {language === 'en' ? 'Address' : 'Dirección Física'}
                       </label>
                       <Input 
                         value={address} 
                         onChange={(e) => setAddress(e.target.value)} 
                         placeholder={language === 'en' ? 'Main Headquarters' : 'Sede Principal, C/ Mayor 1'}
                       />
                    </div>
                  </div>
                  
                  <hr className="border-white/10 my-4" />
                  
                  <h3 className="text-sm font-bold text-[var(--color-primary)]">Redes Sociales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">Facebook URL</label>
                      <Input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." />
                     </div>
                     <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">Twitter URL</label>
                      <Input value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://twitter.com/..." />
                     </div>
                     <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">Instagram URL</label>
                      <Input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." />
                     </div>
                     <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70">LinkedIn URL</label>
                      <Input value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/..." />
                     </div>
                  </div>
                </div>
              )}
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

          <GlassCard className="p-6 flex flex-col gap-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Blocks className="w-5 h-5 text-[var(--color-primary)]" />
              {language === 'en' ? 'Active Modules' : 'Módulos Activos'}
            </h2>
            
            <div className="space-y-4">
              {AVAILABLE_MODULES.map(mod => {
                const isActive = activeModules.includes(mod.id);
                const isCore = mod.id === 'core';
                return (
                  <div key={mod.id} className="flex items-start gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 transition-colors hover:border-white/10">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        id={`mod-${mod.id}`}
                        checked={isActive}
                        disabled={isCore}
                        onChange={() => handleToggleModule(mod.id)}
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`mod-${mod.id}`} className={`font-bold block cursor-pointer ${isActive ? 'text-white' : 'text-white/50'}`}>
                        {mod.label}
                      </label>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-white/30'}`}>{mod.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-white/30 mt-2">
              {language === 'en' 
                ? 'Disabling modules will hide those features immediately for your associated farmers.' 
                : 'Los módulos que desactives ocultarán inmediatamente esas funciones para tus agricultores.'}
            </p>
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

            {showPublicPage && tenant?.slug && (
              <GlassCard className="p-5 mt-6 border border-[var(--color-primary)]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent pointer-events-none" />
                <h3 className="font-bold text-sm flex items-center gap-2 text-white mb-2 relative z-10">
                  <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                  {language === 'en' ? 'Your Public Landing Page' : 'Tu Landing Page Pública'}
                </h3>
                <p className="text-xs text-white/60 mb-4 relative z-10 leading-relaxed">
                  {language === 'en' 
                    ? 'Share this link to onboard your farmers and showcase your cooperative.' 
                    : 'Comparte este enlace para captar socios y mostrar los servicios de tu entidad.'}
                </p>
                <div className="flex items-center gap-2 relative z-10">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${origin}/c/${tenant.slug}`}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors selection:bg-[var(--color-primary)]/30"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      navigator.clipboard.writeText(`${origin}/c/${tenant.slug}`);
                      toast(language === 'en' ? 'Link copied!' : '¡Enlace copiado!', 'success');
                    }}
                    title={language === 'en' ? 'Click to copy' : 'Haz clic para copiar'}
                  />
                  <a 
                    href={`/c/${tenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 p-2 font-bold text-black rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-lg"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40` }}
                    title={language === 'en' ? 'Visit Page' : 'Visitar Página'}
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
