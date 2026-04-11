'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFarmerCuadernoStatus(farmerId: string, campanaId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cuaderno_validaciones')
    .select('*')
    .eq('farmer_id', farmerId)
    .eq('campana_id', campanaId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
     console.error('Error fetching validation status:', error);
     return null;
  }

  return data;
}

export async function validateCuaderno(data: {
  farmer_id: string;
  campana_id: string;
  estado: 'validado' | 'con_observaciones' | 'rechazado';
  observaciones?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('cuaderno_validaciones')
    .upsert({
      ...data,
      technician_id: user.id,
      validated_at: new Date().toISOString()
    }, {
      onConflict: 'farmer_id, campana_id'
    });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/technician/farmer/${data.farmer_id}/cuaderno`);
  return { success: true };
}

export async function getFarmerFullProfile(farmerId: string) {
  const supabase = await createClient();
  
  // 1. User/Tenant basic data
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, tenant_id')
    .eq('id', farmerId)
    .single();

  if (!userData) return null;

  // 2. Explotaciones y Parcelas
  const { data: explotaciones } = await supabase
    .from('explotaciones')
    .select('*, parcelas(*)')
    .eq('user_id', farmerId);

  // 3. Campañas
  const { data: campanas } = await supabase
    .from('campanas')
    .select('*')
    .order('anio_inicio', { ascending: false });

  return {
    ...userData,
    explotaciones: explotaciones || [],
    parcelas: explotaciones?.flatMap(e => e.parcelas) || [],
    campanas: campanas || []
  };
}
