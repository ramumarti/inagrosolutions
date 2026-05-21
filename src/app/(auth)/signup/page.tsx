"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Search, ArrowRight, Building2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

function FarmerSignupContent() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  
  const { toast } = useToast();
  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setTenant(null);
    
    // Look up the tenant by slug (code)
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug, logo_url, primary_color')
      .eq('slug', code.toLowerCase().trim())
      .single();
      
    setLoading(false);
    
    if (error || !data) {
      toast('No hemos encontrado ninguna entidad con ese código. Verifica el código proporcionado.', 'error');
    } else {
      setTenant(data);
    }
  };

  const handleContinue = () => {
    if (tenant) {
      router.push(`/planes?tenant=${tenant.slug}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 p-4 min-h-screen pt-24 pb-12">
      <GlassCard className="flex flex-col items-center w-full p-8 sm:p-10 relative overflow-hidden">
        
        {tenant ? (
          <div className="absolute top-0 w-full h-1.5" style={{ background: `linear-gradient(to right, ${tenant.primary_color || '#10B981'}, transparent)` }} />
        ) : (
          <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-pink)]" />
        )}

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border" 
             style={{ 
               backgroundColor: tenant ? `${tenant.primary_color || '#10B981'}33` : 'rgba(0, 255, 102, 0.2)', 
               borderColor: tenant ? `${tenant.primary_color || '#10B981'}4D` : 'rgba(0, 255, 102, 0.3)'
             }}>
          {tenant && tenant.logo_url ? (
            <img src={tenant.logo_url} alt="Logo Entidad" className="h-10 object-contain" />
          ) : (
            <Leaf className="w-8 h-8" style={{ color: tenant ? tenant.primary_color || '#10B981' : 'var(--color-primary)' }} />
          )}
        </div>
        
        <h1 className="text-2xl font-black mb-2 text-center uppercase tracking-tighter text-white italic">
          Registro de Agricultor
        </h1>
        
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
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-6 text-center">
              <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">Entidad Encontrada</p>
              <p className="text-lg font-bold" style={{ color: tenant.primary_color || '#10B981' }}>{tenant.name}</p>
            </div>
            
            <button 
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: tenant.primary_color || '#10B981', boxShadow: `0 0 20px ${tenant.primary_color || '#10B981'}4D` }}
            >
              Continuar Registro <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => { setTenant(null); setCode(''); }}
              className="mt-4 text-xs text-white/40 hover:text-white uppercase font-bold tracking-widest"
            >
              Usar otro código
            </button>
          </div>
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
