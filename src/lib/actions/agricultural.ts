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
  return {
    success: true,
    data: {
      provincia: 'Madrid',
      municipio: 'Getafe',
      poligono: '12',
      parcela: '45',
      recinto: '1',
      superficie: 2.5,
      geometria: null
    }
  };
}

export async function getSigpacInfoByCoords(lat: number, lng: number) {
  /**
   * ENTORNO REAL:
   * 1. Obtener datos de SIGPAC:
   * https://sigpac.mapa.gob.es/fichasigpac/net/servicios/Servicios.aspx?info=consultar_p_r&lat=${lat}&lng=${lng}&crs=4326
   * 2. Obtener datos de Catastro (WFS/REST):
   * https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=JAEN&Municipio=JAEN&RC=...
   */

  // Simulamos el procesamiento inteligente de la respuesta de los servicios oficiales
  await new Promise(r => setTimeout(r, 1200));
  
  return {
    success: true,
    data: {
      provincia: '23',
      municipio: '46',
      agregado: 0,
      zona: 0,
      poligono: '13',
      parcela: '333',
      recinto: '1',
      x_utm: 455097.60,
      y_utm: 4209681.58,
      referencia_catastral: '23046A013003330000JP',
      hectareas: 3.45,  // Extraído del recinto SIGPAC
      cultivo: 'Olivar', // Extraído de la capa de uso de SIGPAC
      variedad: 'Picual'
    }
  };
}
