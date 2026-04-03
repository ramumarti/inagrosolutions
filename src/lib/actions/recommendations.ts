'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  );
}

export async function getRecommendationsAsTechnician() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      farmer:users!recommendations_farmer_id_fkey(first_name, last_name, email),
      parcela:parcelas!recommendations_parcela_id_fkey(nombre)
    `)
    .eq('technician_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createRecommendation(payload: {
  farmer_id: string;
  parcela_id?: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  fecha_limite?: string;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  
  const { error } = await supabase
    .from('recommendations')
    .insert({
      tenant_id: userData?.tenant_id,
      technician_id: user.id,
      farmer_id: payload.farmer_id,
      parcela_id: payload.parcela_id || null,
      tipo: payload.tipo,
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      prioridad: payload.prioridad,
      fecha_limite: payload.fecha_limite || null,
      estado: 'pendiente'
    });

  if (error) throw error;
  return { success: true };
}

export async function getFarmerParcels(farmerId: string) {
  const supabase = await getSupabase();
  // Fetch explotaciones del usuario
  const { data: explotaciones } = await supabase
    .from('explotaciones')
    .select('id')
    .eq('user_id', farmerId);
    
  if (!explotaciones || explotaciones.length === 0) return [];

  const eIds = explotaciones.map(e => e.id);
  
  // Fetch parcelas de esas explotaciones
  const { data, error } = await supabase
    .from('parcelas')
    .select('id, nombre, hectareas, cultivo')
    .in('explotacion_id', eIds);

  if (error) throw error;
  return data || [];
}

export async function getRecommendationsAsFarmer() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      technician:users!recommendations_technician_id_fkey(first_name, last_name, email),
      parcela:parcelas!recommendations_parcela_id_fkey(nombre)
    `)
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateRecommendationStatus(id: string, estado: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('recommendations')
    .update({ estado })
    .eq('id', id)
    .eq('farmer_id', user.id);

  if (error) throw error;
  return { success: true };
}

