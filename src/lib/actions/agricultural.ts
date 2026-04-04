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

export async function updateExplotacion(id: string, data: { nombre: string, titular?: string, nif_cif?: string }) {
  const supabase = await createClient();
  const { data: res, error } = await supabase
    .from('explotaciones')
    .update({ 
      nombre: data.nombre,
      titular: data.titular,
      nif_cif: data.nif_cif
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/cuaderno');
  return res;
}

export async function deleteExplotacion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('explotaciones')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/cuaderno');
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
  try {
    /**
     * IMPLEMENTACIÓN REAL WFS SIGPAC:
     * Consultamos la intersección del punto (lat, lng) con la capa de recintos de SIGPAC.
     */
    const wfsUrl = `https://wfs.mapa.gob.es/wfs?service=WFS&request=GetFeature&version=2.0.0&typeName=SIGPAC:recintos&outputFormat=application/json&srsName=EPSG:4326&CQL_FILTER=INTERSECTS(geometry,POINT(${lng} ${lat}))`;

    const response = await fetch(wfsUrl);
    if (!response.ok) throw new Error('Error consultando SIGPAC');
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return { success: false, error: 'No se encontró ninguna parcela en esa ubicación' };
    }

    const feature = data.features[0];
    const p = feature.properties;

    // Calculamos Referencia Catastral (Mock aproximado ya que el WFS de Catastro es distinto)
    const refCatastral = `${String(p.provincia).padStart(2, '0')}${String(p.municipio).padStart(3, '0')}A${String(p.poligono).padStart(3, '0')}${String(p.parcela).padStart(5, '0')}0000JP`;

    return {
      success: true,
      data: {
        provincia: String(p.provincia),
        municipio: String(p.municipio),
        agregado: p.agregado || 0,
        zona: p.zona || 0,
        poligono: String(p.poligono),
        parcela: String(p.parcela),
        recinto: String(p.recinto),
        referencia_catastral: refCatastral,
        hectareas: p.superficie / 10000, // De m2 a Ha
        cultivo: p.uso_sigpac || 'No definido',
        variedad: '',
        geometria: feature.geometry,
        // Coordenadas UTM aproximadas si se necesitan (el WFS devuelve 4326 por defecto)
        x_utm: 0, 
        y_utm: 0
      }
    };
  } catch (error) {
    console.error('SIGPAC WFS Error:', error);
    return { success: false, error: 'Fallo en la conexión con el servidor SIGPAC' };
  }
}
