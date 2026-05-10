"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Hexagon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast("Las contraseñas no coinciden", 'error');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    setLoading(false);
    
    if (error) {
      toast(error.message, 'error');
    } else {
      toast("Contraseña actualizada correctamente", 'success');
      router.push('/login');
    }
  };

  return (
    <GlassCard className="flex flex-col items-center w-full max-w-md mx-auto p-8 sm:p-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-primary)]/30">
        <Hexagon className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2 glow-text text-center">
        Actualizar Contraseña
      </h1>
      <p className="text-[color:var(--color-base-content)] opacity-70 mb-8 text-center text-sm">
        {t('app.name')}
      </p>

      <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
        <Input 
          type="password" 
          placeholder="Nueva contraseña" 
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        
        <Input 
          type="password" 
          placeholder="Confirmar contraseña" 
          icon={<Lock className="w-5 h-5" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        
        <GlowButton type="submit" isLoading={loading} className="w-full mt-2">
          Actualizar y Entrar
        </GlowButton>
      </form>
    </GlassCard>
  );
}
