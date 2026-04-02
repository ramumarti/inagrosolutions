'use server'

import { createClient } from '@/lib/supabase/server';
import { CreateExplotacionSchema, CreateParcelaSchema, CreateFertilizacionSchema, CreatePlagaSchema } from '@/lib/agriculture/schemas';
import { revalidatePath } from 'next/cache';

/**
 * AGRICULTURE SERVICE (Integrated Pro Architecture)
 * 
 * Handles business logic for Fincas and Parcelas.
 */

export async function createExplotacionAction(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autorizado" };

  try {
    const result = CreateExplotacionSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Datos de explotación inválidos", details: result.error.format() };
    }

    const { data: record, error: dbError } = await supabase
      .from('explotaciones')
      .insert([{
        user_id: user.id,
        nombre: result.data.nombre,
        ubicacion: result.data.ubicacion,
        num_registro_siex: result.data.num_registro_siex,
        superficie_total: result.data.superficie_total
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    revalidatePath('/cuaderno');
    return { success: true, data: record };

  } catch (error: any) {
    console.error('Agriculture Error:', error);
    return { success: false, error: "Error al crear la explotación" };
  }
}

export async function createParcelaAction(data: any) {
  const supabase = await createClient();
  
  try {
    const result = CreateParcelaSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Datos de parcela inválidos", details: result.error.format() };
    }

    const { data: record, error: dbError } = await supabase
      .from('parcelas')
      .insert([result.data])
      .select()
      .single();

    if (dbError) throw dbError;

    // Update the total surface of the farm automatically
    const { data: farm } = await supabase
      .from('explotaciones')
      .select('superficie_total')
      .eq('id', result.data.explotacion_id)
      .single();
    
    if (farm) {
       await supabase
         .from('explotaciones')
         .update({ superficie_total: (farm.superficie_total || 0) + result.data.superficie })
         .eq('id', result.data.explotacion_id);
    }

    revalidatePath('/cuaderno');
    return { success: true, data: record };

  } catch (error: any) {
    console.error('Parcela Error:', error);
    return { success: false, error: "Error al registrar la parcela" };
  }
}

export async function createFertilizacionAction(data: any) {
  const supabase = await createClient();
  
  try {
    const result = CreateFertilizacionSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Datos de abonado inválidos", details: result.error.format() };
    }

    const { data: record, error: dbError } = await supabase
      .from('fertilizaciones')
      .insert([{
        parcela_id: result.data.parcela_id,
        fecha: result.data.fecha.toISOString(),
        tipo_abono: result.data.producto,
        dosis: result.data.cantidad,
        unidad_dosis: result.data.unidad,
        metodo_aplicacion: result.data.metodo,
        justificacion: result.data.justificacion,
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    revalidatePath('/cuaderno');
    return { success: true, data: record };

  } catch (error: any) {
    console.error('Fertilization Error:', error);
    return { success: false, error: "Error al registrar el abonado" };
  }
}

export async function createPlagaAction(data: any) {
  const supabase = await createClient();
  
  try {
    const result = CreatePlagaSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Datos de monitoreo inválidos", details: result.error.format() };
    }

    const { data: record, error: dbError } = await supabase
      .from('plagas')
      .insert([{
        parcela_id: result.data.parcela_id,
        fecha: result.data.fecha.toISOString(),
        tipo_plaga: result.data.tipo_plaga,
        nivel: result.data.nivel,
        umbral: result.data.umbral,
        recomendacion: result.data.recomendacion
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    revalidatePath('/cuaderno');
    return { success: true, data: record };

  } catch (error: any) {
    console.error('Plaga Error:', error);
    return { success: false, error: "Error al registrar el monitoreo" };
  }
}

