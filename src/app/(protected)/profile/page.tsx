"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, User, Mail, Save, Shield, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);

      const { data: userData, error } = await supabase
        .from('users')
        .select('*, plans(name_en, name_es)')
        .eq('id', authUser.id)
        .single();

      if (userData) {
        setProfile(userData);
        setFormData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!user || !isDirty) return;
    setSaving(true);
    
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      });

      if (authError) throw authError;

      toast(language === 'en' ? 'Profile updated successfully' : 'Perfil actualizado correctamente', 'success');
      setIsDirty(false);
      
      // Update local state to reflect changes immediately
      setProfile((prev: any) => ({ ...prev, first_name: formData.firstName, last_name: formData.lastName }));
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation: 1MB limit
    if (file.size > 1024 * 1024) {
      toast(language === 'en' ? 'File size must be less than 1MB' : 'El archivo debe pesar menos de 1MB', 'error');
      return;
    }

    // Validation: Types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast(language === 'en' ? 'Only PNG, JPEG, GIF or WebP allowed' : 'Solo se permiten PNG, JPEG, GIF o WebP', 'error');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Database
      const { error: dbError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Update Auth Metadata (so Header updates)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (authError) throw authError;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      toast(language === 'en' ? 'Avatar updated!' : '¡Avatar actualizado!', 'success');
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  const initials = (profile?.first_name?.charAt(0) || '') + (profile?.last_name?.charAt(0) || '');
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">
          {language === 'en' ? 'My Profile' : 'Mi Perfil'}
        </h1>
        <p className="text-white/50">
          {language === 'en' ? 'Manage your personal information and preferences' : 'Gestiona tu información personal y preferencias'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="flex flex-col items-center text-center p-8">
            <div className="relative group mb-6">
              <div 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/10 overflow-hidden bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent-blue)] flex items-center justify-center shadow-2xl relative"
              >
                {uploading ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : null}
                
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white uppercase">{initials || 'U'}</span>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-[var(--color-base-100)] z-30"
                title={language === 'en' ? 'Change photo' : 'Cambiar foto'}
              >
                <Camera className="w-5 h-5" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <h2 className="text-xl font-bold text-white truncate">
                {profile?.first_name} {profile?.last_name}
              </h2>
              
              <div className="flex items-center justify-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  profile?.role === 'admin' 
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}>
                  {profile?.role === 'admin' ? (language === 'en' ? 'Admin' : 'Administrador') : (language === 'en' ? 'User' : 'Usuario')}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3 text-sm text-white/60">
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-4 h-4 opacity-50" />
                  <span>
                    {language === 'en' ? `Member since ${joinDate}` : `Miembro desde ${joinDate}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <CreditCard className="w-4 h-4 opacity-50" />
                  <span className="text-[var(--color-primary)] font-medium">
                    {profile?.plans ? (language === 'en' ? `Plan ${profile.plans.name_en}` : `Plan ${profile.plans.name_es}`) : (language === 'en' ? 'No active plan' : 'Sin plan activo')}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--color-primary)]" />
              {language === 'en' ? 'Personal Information' : 'Información Personal'}
            </h3>

            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70 ml-1">
                    {language === 'en' ? 'First Name' : 'Nombre'}
                  </label>
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    placeholder={language === 'en' ? 'e.g. John' : 'ej: Juan'}
                    className="bg-white/5 border-white/10 focus:border-[var(--color-primary)]/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70 ml-1">
                    {language === 'en' ? 'Last Name' : 'Apellido'}
                  </label>
                  <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    placeholder={language === 'en' ? 'e.g. Doe' : 'ej: Pérez'}
                    className="bg-white/5 border-white/10 focus:border-[var(--color-primary)]/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/30 ml-1 flex items-center gap-2">
                  {language === 'en' ? 'Email Address' : 'Correo Electrónico'}
                  <Shield className="w-3 h-3 text-white/20" />
                </label>
                <div className="relative group">
                  <Input 
                    disabled 
                    value={profile?.email || ''} 
                    icon={<Mail className="w-4 h-4" />}
                    className="bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed"
                  />
                  <div className="absolute inset-0 bg-transparent cursor-not-allowed" title={language === 'en' ? 'Email cannot be changed' : 'El email no se puede cambiar'} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <GlowButton 
                  onClick={handleSave} 
                  disabled={!isDirty || saving}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  <div className="flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
                  </div>
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
