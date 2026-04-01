import { createClient } from '@/lib/supabase/server';
import { AgriculturalValidator, SistemaProduccion } from '@/lib/agriculture/validations';
import { NextResponse } from 'next/server';

/**
 * API ENDPOINT: POST /api/tratamientos
 * 
 * Create a new fitosanitary treatment with business logic validation.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const payload = await request.json();
  const { parcela_id, numero_registro, fecha, ...rest } = payload;

  try {
    // 1. Fetch parcel data to check system type
    const { data: parcela, error: pError } = await supabase
      .from('parcelas')
      .select('sistema_produccion')
      .eq('id', parcela_id)
      .single();

    if (pError || !parcela) {
      return NextResponse.json({ error: 'Parcela no encontrada' }, { status: 404 });
    }

    // 2. Validate Agricultural Rules
    const validation = AgriculturalValidator.validateTratamiento(
      parcela as { sistema_produccion: SistemaProduccion },
      { numero_registro, nivel_plaga: rest.nivel_plaga }
    );

    if (!validation.valid && validation.level === 'error') {
      return NextResponse.json({ 
        error: validation.message, 
        code: 'VALIDATION_ERROR' 
      }, { status: 400 });
    }

    // 3. Save to DB
    const { data, error } = await supabase
      .from('tratamientos_fitosanitarios')
      .insert({
        parcela_id,
        numero_registro,
        fecha: fecha || new Date().toISOString(),
        ...rest
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      warning: !validation.valid ? validation.message : null 
    }, { status: 201 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/tratamientos?parcela_id=...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parcela_id = searchParams.get('parcela_id');
  const supabase = await createClient();

  let query = supabase.from('tratamientos_fitosanitarios').select('*');
  
  if (parcela_id) {
    query = query.eq('parcela_id', parcela_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
