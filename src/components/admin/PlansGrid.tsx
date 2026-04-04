"use client";

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { GlowButton } from '@/components/ui/GlowButton';
import { Plus, Edit3, Trash2, X, Check, FileText, LayoutGrid, Zap, Sparkles, PenTool, Mail, Briefcase, Share2, Video, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap
};

export interface PlanData {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price_monthly: number;
  items_en: string[];
  items_es: string[];
  users_count?: number;
}

export interface MicroApp {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  icon: string;
}

interface PlansGridProps {
  initialPlans: PlanData[];
}

export function PlansGrid({ initialPlans }: PlansGridProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<PlanData[]>(initialPlans);

  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditor = (plan?: PlanData) => {
    if (plan) {
      setEditingPlan(plan);
    } else {
      setEditingPlan({
        id: '',
        slug: `plan-${Date.now()}`,
        name_en: '',
        name_es: '',
        description_en: '',
        description_es: '',
        price_monthly: 0,
        items_en: [],
        items_es: [],
        users_count: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    try {
      const isNew = !editingPlan.id;
      const res = await fetch('/api/admin/save-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'create' : 'update',
          ...editingPlan
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isNew) {
        setPlans([...plans, { ...data.plan, users_count: 0 }]);
      } else {
        setPlans(plans.map(p => p.id === data.plan.id ? { ...data.plan, users_count: p.users_count } : p));
      }

      toast(language === 'en' ? 'Plan saved' : 'Plan guardado', 'success');
      closeEditor();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (plan: PlanData) => {
    if (plan.users_count && plan.users_count > 0) return;
    if (!confirm(language === 'en' ? "Are you sure you want to delete this plan?" : "¿Estás seguro de que quieres eliminar este plan?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setPlans(plans.filter(p => p.id !== plan.id));
      toast(language === 'en' ? 'Plan deleted' : 'Plan eliminado', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-20">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">
            {language === 'en' ? 'Plans Management' : 'Gestión de Planes'}
          </h1>
          <p className="text-white/60">
            {language === 'en' ? 'Create and edit subscription tiers' : 'Crea y edita los niveles de suscripción'}
          </p>
        </div>
        <GlowButton onClick={() => openEditor()}>
          <Plus className="w-5 h-5 mr-2" />
          {language === 'en' ? 'Add New Plan' : 'Agregar Nuevo Plan'}
        </GlowButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          return (
            <div key={plan.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-6 backdrop-blur-md shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">{language === 'en' ? plan.name_en : plan.name_es}</h3>
                  <div className="text-[var(--color-primary)] font-semibold mt-1">
                    {plan.price_monthly} €/mo
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-sm font-medium text-white/70">
                  {plan.users_count} {language === 'en' ? 'users' : 'usuarios'}
                </div>
              </div>

              <div className="space-y-2 flex-grow">
                <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {language === 'en' ? 'Features' : 'Características'}
                </h4>
                <ul className="space-y-2">
                  {(language === 'en' ? plan.items_en : plan.items_es).map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>



              <div className="flex gap-2 mt-2 pt-4 border-t border-white/10">
                <button 
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex justify-center items-center gap-2"
                  onClick={() => openEditor(plan)}
                >
                  <Edit3 className="w-4 h-4" />
                  {language === 'en' ? 'Edit Plan' : 'Editar Plan'}
                </button>
                <button 
                  className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group relative"
                  onClick={() => handleDelete(plan)}
                  disabled={plan.users_count! > 0 || isDeleting}
                  title={plan.users_count! > 0 ? (language === 'en' ? "Cannot delete — users on this plan" : "No se puede eliminar — usuarios en este plan") : ""}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-xl"
             onClick={(e) => { if (e.target === e.currentTarget) closeEditor(); }}>
          <div className="w-full max-w-2xl bg-[var(--color-base-100)] border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
             
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
               <h2 className="text-xl font-bold">
                 {editingPlan.id 
                    ? (language === 'en' ? 'Edit Plan' : 'Editar Plan') 
                    : (language === 'en' ? 'Create Plan' : 'Crear Plan')}
               </h2>
               <button onClick={closeEditor} className="text-white/50 hover:text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Name (EN)</label>
                  <input required value={editingPlan.name_en} onChange={e => setEditingPlan({...editingPlan, name_en: e.target.value})} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Name (ES)</label>
                  <input required value={editingPlan.name_es} onChange={e => setEditingPlan({...editingPlan, name_es: e.target.value})} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm text-white/70">Price Monthly (€)</label>
                <input required type="number" step="0.01" value={editingPlan.price_monthly} onChange={e => setEditingPlan({...editingPlan, price_monthly: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" />
              </div>

              {/* Items List EN */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Features (EN)</label>
                {editingPlan.items_en.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input required value={item} onChange={e => {
                      const newArr = [...editingPlan.items_en];
                      newArr[idx] = e.target.value;
                      setEditingPlan({...editingPlan, items_en: newArr});
                    }} className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                    <button type="button" onClick={() => {
                        const newArr = editingPlan.items_en.filter((_, i) => i !== idx);
                        setEditingPlan({...editingPlan, items_en: newArr});
                    }} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditingPlan({...editingPlan, items_en: [...editingPlan.items_en, '']})} className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                  + Add Item (EN)
                </button>
              </div>

              {/* Items List ES */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Features (ES)</label>
                {editingPlan.items_es.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input required value={item} onChange={e => {
                      const newArr = [...editingPlan.items_es];
                      newArr[idx] = e.target.value;
                      setEditingPlan({...editingPlan, items_es: newArr});
                    }} className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                    <button type="button" onClick={() => {
                        const newArr = editingPlan.items_es.filter((_, i) => i !== idx);
                        setEditingPlan({...editingPlan, items_es: newArr});
                    }} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditingPlan({...editingPlan, items_es: [...editingPlan.items_es, '']})} className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                  + Add Item (ES)
                </button>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
                <button type="button" onClick={closeEditor} className="px-4 py-2 rounded-lg text-white/70 hover:bg-white/5 transition-colors">
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <GlowButton type="submit">
                  {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
