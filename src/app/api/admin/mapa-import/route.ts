import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function parseCSV(text: string, delimiter: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // saltar la comilla escapada
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentValue.trim());
      lines.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  if (currentValue || row.length > 0) {
    row.push(currentValue.trim());
    lines.push(row);
  }
  return lines;
}

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
    if (!text.trim()) {
      return NextResponse.json({ error: 'El archivo CSV está vacío' }, { status: 400 });
    }

    const delimiter = text.includes(';') ? ';' : ',';
    const parsedData = parseCSV(text, delimiter);
    
    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No se pudieron procesar las líneas del CSV' }, { status: 400 });
    }

    // Cabeceras en minúsculas y limpias
    const headers = parsedData[0].map(h => h.toLowerCase().trim().replace(/"/g, ''));
    
    // Validar cabeceras requeridas mínimas
    const numRegIndex = headers.indexOf('numero_registro');
    const nombreComIndex = headers.indexOf('nombre_comercial');

    if (numRegIndex === -1 || nombreComIndex === -1) {
      return NextResponse.json({ 
        error: 'Estructura inválida. El CSV debe contener al menos las columnas: "numero_registro" y "nombre_comercial"' 
      }, { status: 400 });
    }

    const records = [];
    for (let i = 1; i < parsedData.length; i++) {
      const values = parsedData[i];
      if (values.length <= 1 || !values[numRegIndex]) continue;

      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || null;
      });

      // Mapear cabeceras oficiales al formato de base de datos
      records.push({
        numero_registro: obj['numero_registro'],
        nombre_comercial: obj['nombre_comercial'],
        titular: obj['titular'] || null,
        materia_activa: obj['materia_activa'] || obj['sustancia_activa'] || null,
        tipo_accion: obj['tipo_accion'] || null,
        tipo_formulacion: obj['tipo_formulacion'] || null,
        cultivos_autorizados: obj['cultivos_autorizados'] 
          ? JSON.stringify(obj['cultivos_autorizados'].split('|').map((c: string) => c.trim())) 
          : '[]',
        dosis_maxima: obj['dosis_maxima'] ? Number(obj['dosis_maxima']) : null,
        unidad_dosis: obj['unidad_dosis'] || 'L/ha',
        plazo_seguridad_dias: obj['plazo_seguridad_dias'] ? Number(obj['plazo_seguridad_dias']) : null,
        estado: obj['estado'] || 'Vigente',
        fecha_registro: obj['fecha_registro'] || null,
        fecha_caducidad: obj['fecha_caducidad'] || null,
        clasificacion_toxicologica: obj['clasificacion_toxicologica'] || null,
        observaciones: obj['observaciones'] || null
      });
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'No se encontraron registros válidos para importar' }, { status: 400 });
    }

    // Insertar en lotes a Supabase
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('productos_fitosanitarios')
        .upsert(batch, { onConflict: 'numero_registro' });
        
      if (error) {
        console.error(`Error en lote de inserción (registro ${i} al ${i + batch.length}):`, error);
        throw new Error(`Error en base de datos al guardar lote: ${error.message}`);
      }
      inserted += batch.length;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (error: any) {
    console.error('Error importing MAPA CSV:', error);
    return NextResponse.json({ error: error.message || 'Error en la importación del vademécum' }, { status: 500 });
  }
}
