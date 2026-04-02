'use server'

import { createClient } from '@/lib/supabase/server';
import { CreateTreatmentSchema, CreateTreatmentDto } from '@/lib/agriculture/schemas';
import { AgriculturalValidator } from '@/lib/agriculture/validations';
import { revalidatePath } from 'next/cache';

/**
 * TREATMENT SERVICE (Integrated Architecture)
 * 
 * Mimics NestJS modules but fits Next.js Server Actions.
 * Handles validation, business rules, and DB persistence.
 */
export async function createTreatmentAction(data: any) {
  const supabase = await createClient();
  
  try {
    // 1. DATA VALIDATION (Zod / NestJS DTO equivalent)
    const result = CreateTreatmentSchema.safeParse(data);
    if (!result.success) {
      return { 
        success: false, 
        error: "DATOS INVÁLIDOS", 
        details: result.error.flatten().fieldErrors 
      };
    }
    
    const treatmentDto = result.data;

    // 2. FETCH PARCELA METADATA (For agricultural rules)
    const { data: parcela, error: pError } = await supabase
      .from('parcelas')
      .select('sistema_produccion, nombre')
      .eq('id', treatmentDto.parcela_id)
      .single();

    if (pError || !parcela) {
      return { success: false, error: "Parcela no encontrada" };
    }

    // 3. BUSINESS RULE ENFORCEMENT (Inspired by NestJS Controller logic + AgriculturalValidator)
    if (!treatmentDto.ropo) {
      return { success: false, error: "ROPO OBLIGATORIO: No se puede registrar un tratamiento sin carnet habilitado." };
    }

    const rules = AgriculturalValidator.validateTratamiento(
      { sistema_produccion: parcela.sistema_produccion as any },
      { 
        numero_registro: treatmentDto.numero_registro, 
        nivel_plaga: treatmentDto.nivel_plaga,
        plaga_objetivo: treatmentDto.plaga_objetivo 
      }
    );

    if (!rules.valid && rules.level === 'error') {
      return { success: false, error: rules.message };
    }

    // 4. PERSISTENCE (Supabase PostgreSQL / TypeORM equivalent)
    const { data: record, error: dbError } = await supabase
      .from('tratamientos_fitosanitarios')
      .insert([{
        parcela_id: treatmentDto.parcela_id,
        fecha: treatmentDto.fecha.toISOString(),
        producto: treatmentDto.producto,
        numero_registro: treatmentDto.numero_registro,
        dosis: treatmentDto.dosis,
        volumen_caldo: treatmentDto.unidad.includes('litros') ? treatmentDto.dosis : 0,
        plaga_objetivo: treatmentDto.plaga_objetivo,
        metodo_aplicacion: treatmentDto.metodo_aplicacion,
        aplicador: treatmentDto.ropo,
        carnet_aplicador: treatmentDto.ropo
      }])
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      return { success: false, error: `Error en base de datos: ${dbError.message}` };
    }

    // 5. CACHE INVALIDATION
    revalidatePath('/cuaderno');
    revalidatePath(`/cuaderno/parcelas/${treatmentDto.parcela_id}`);

    return { 
      success: true, 
      data: record,
      message: rules.message // Might be a warning even if valid: true
    };

  } catch (error: any) {
    return { success: false, error: "Error interno del servidor" };
  }
}
