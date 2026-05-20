import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
    if (userData?.platform_role !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
    }

    const text = await file.text();
    // Parseo muy básico de CSV (Asumiendo delimitador ';' que es común en exportaciones españolas, o ',')
    const delimiter = text.includes(';') ? ';' : ',';
    const lines = text.split('\n');
    
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const records = [];
    // Asumimos columnas: numero_registro, nombre_comercial, titular, materia_activa, cultivos_autorizados (JSON o comma-separated), dosis_maxima, unidad_dosis, plazo_seguridad_dias
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || null;
      });

      if (!obj['numero_registro'] || !obj['nombre_comercial']) continue;

      records.push({
        numero_registro: obj['numero_registro'],
        nombre_comercial: obj['nombre_comercial'],
        titular: obj['titular'] || null,
        materia_activa: obj['materia_activa'] || null,
        tipo_accion: obj['tipo_accion'] || null,
        cultivos_autorizados: obj['cultivos_autorizados'] ? JSON.stringify(obj['cultivos_autorizados'].split('|')) : '[]',
        dosis_maxima: obj['dosis_maxima'] ? Number(obj['dosis_maxima']) : null,
        unidad_dosis: obj['unidad_dosis'] || null,
        plazo_seguridad_dias: obj['plazo_seguridad_dias'] ? Number(obj['plazo_seguridad_dias']) : null,
        estado: obj['estado'] || 'Vigente'
      });
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'No se encontraron registros válidos' }, { status: 400 });
    }

    // Insertar en lotes (Supabase / PostgREST limit: 1000 por request es seguro)
    const BATCH_SIZE = 500;
    let inserted = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('productos_fitosanitarios')
        .upsert(batch, { onConflict: 'numero_registro' });
        
      if (error) throw error;
      inserted += batch.length;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (error: any) {
    console.error('Error importing MAPA CSV:', error);
    return NextResponse.json({ error: error.message || 'Error en la importación' }, { status: 500 });
  }
}
