"use client";

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { GlowButton } from '@/components/ui/GlowButton';
import { Loader2 } from 'lucide-react';
import { Select, SelectOption } from '@/components/ui/Select';

interface UserPlanActionProps {
  userId: string;
  currentPlanId: string | null;
  plans: { id: string; name_en: string; name_es: string; price_monthly: number }[];
}

export function UserPlanAction({ userId, currentPlanId, plans }: UserPlanActionProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId: selectedPlanId || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast(language === 'en' ? 'Plan updated successfully' : 'Plan actualizado con éxito', 'success');
    } catch (err: any) {
      toast(err.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = selectedPlanId !== (currentPlanId || '');

  const selectOptions: SelectOption[] = [
    { value: '', label: language === 'en' ? 'Remove Plan (No Plan)' : 'Remover Plan (Sin Plan)' },
    ...plans.map(p => ({
      value: p.id,
      label: `${language === 'en' ? p.name_en : p.name_es} - ${p.price_monthly} €/mo`
    }))
  ];

  return (
    <div className="flex flex-col gap-4 mt-2">
      <Select 
        value={selectedPlanId} 
        onChange={setSelectedPlanId}
        options={selectOptions}
        className="w-full"
      />

      <GlowButton 
        onClick={handleSave} 
        disabled={!hasChanged || isSaving}
        className="w-full justify-center"
      >
        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {language === 'en' ? 'Save Plan' : 'Guardar Plan'}
      </GlowButton>
    </div>
  );
}
