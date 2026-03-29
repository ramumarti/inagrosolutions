"use client";

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Zap, X, Loader2, RefreshCw } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import type { PlanInfo, UserRow } from './UsersTable';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: (newUser: UserRow) => void;
  activePlans: PlanInfo[];
}

const FIRST_NAMES = ["Carlos", "Ana", "Luis", "María", "Pedro", "Sofía", "Jorge", "Laura", "Andrés", "Valentina"];
const LAST_NAMES = ["García", "López", "Martínez", "Rodríguez", "Hernández", "Pérez", "González", "Sánchez", "Torres", "Ramírez"];

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for(let i=0; i<8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

export function AddUserModal({ onClose, onSuccess, activePlans }: AddUserModalProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState('');
  const [planCycleIndex, setPlanCycleIndex] = useState(0);

  const handleQuickGenerate = () => {
    setFirstName(FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]);
    setLastName(LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]);
    const r5 = Math.random().toString(36).substring(2, 7);
    setEmail(`demo_${r5}@gmail.com`);
    setPassword(generatePassword());
    
    if (activePlans.length > 0) {
      const idx = planCycleIndex % activePlans.length;
      setPlanId(activePlans[idx].id);
      setPlanCycleIndex(planCycleIndex + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, planId: planId || null })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      // We manually construct the UserRow mockup from input since the API triggers DB update async
      const selectedPlan = activePlans.find(p => p.id === planId);
      const newUserLocal: UserRow = {
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        created_at: new Date().toISOString(),
        plan_id: planId || null,
        plans: selectedPlan ? { name_en: selectedPlan.name_en, name_es: selectedPlan.name_es, slug: 'known' } : null
      };
      
      onSuccess(newUserLocal);
      toast(
        language === 'en' 
          ? `User created: ${email} | Password: ${password}`
          : `Usuario creado: ${email} | Contraseña: ${password}`,
        'success'
      );
      onClose();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[var(--color-base-100)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">
            {language === 'en' ? 'Add New User' : 'Agregar Nuevo Usuario'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <button
            type="button"
            onClick={handleQuickGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 font-semibold border border-yellow-500/30 flex items-center justify-center gap-2 hover:bg-yellow-500/30 transition-all active:scale-[0.98]"
          >
            <Zap className="w-5 h-5 fill-yellow-500" />
            {language === 'en' ? '⚡ Quick Generate Demo' : '⚡ Generar Demo Rápido'}
          </button>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm text-white/70">{language === 'en' ? 'First Name' : 'Nombre'}</label>
              <input 
                required
                type="text" 
                value={firstName} onChange={e => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" 
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm text-white/70">{language === 'en' ? 'Last Name' : 'Apellido'}</label>
              <input 
                required
                type="text" 
                value={lastName} onChange={e => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Email</label>
            <input 
              required
              type="email" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">{language === 'en' ? 'Password' : 'Contraseña'}</label>
            <div className="flex gap-2">
              <input 
                required
                type="text" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white font-mono" 
              />
              <button 
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                title={language === 'en' ? 'Regenerate' : 'Regenerar'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Plan</label>
            <select 
              value={planId} onChange={e => setPlanId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-base-200)] border border-white/10 rounded-lg text-white focus:outline-none"
            >
              <option value="">{language === 'en' ? 'No Plan' : 'Sin Plan'}</option>
              {activePlans.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'en' ? p.name_en : p.name_es}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
            <GlowButton type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Create User' : 'Crear Usuario'}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}
