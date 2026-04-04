'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExplotacion(data: { nombre: string, num_registro_siex?: string, tenant_id?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: res, error } = await supabase
    .from('explotaciones')
    .insert([{
      ...data,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/cuaderno');
  return res;
}

export async function createParcela(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: res, error } = await supabase
    .from('parcelas')
    .insert([{
      ...data,
      tenant_id: data.tenant_id // Optional, normally should be set correctly from context
    }])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/cuaderno');
  return res;
}

export async function deleteParcela(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('parcelas')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/cuaderno');
}

export async function createCampana(data: { explotacion_id: string, nombre: string, anio_inicio: number, anio_fin: number }) {
  const supabase = await createClient();
  const { data: res, error } = await supabase
    .from('campanas')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/cuaderno');
  return res;
}

export async function importFromSigpac(referencia: string) {
  // Mock external API call to SIGPAC
  // In a real scenario, we'd fetch from https://wms.mapa.gob.es/sigpac/wms...
  return {
    success: true,
    data: {
      provincia: 'Madrid',
      municipio: 'Getafe',
      poligono: '12',
      parcela: '45',
      recinto: '1',
      superficie: 2.5,
      // GeoJSON coordinates example
      geometria: {
        type: 'Polygon',
        coordinates: [[/* ... */]]
      }
    }
  };
}
