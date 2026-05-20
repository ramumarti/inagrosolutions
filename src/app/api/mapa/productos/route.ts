import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface ProductoMAPA {
  numRegistro: string;
  nombreComercial: string;
  titular: string;
  materiaActiva: string;
  estado: string; // 'Vigente' | 'Cancelado'
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ error: 'La búsqueda debe tener al menos 3 caracteres' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // Búsqueda en nombre_comercial y materia_activa usando el índice GIN
    // Nota: supabase textSearch requiere formato tsquery, por lo que adaptamos la búsqueda
    const tsQuery = query.trim().split(/\s+/).map(word => `${word}:*`).join(' & ');

    const { data, error } = await supabase
      .from('productos_fitosanitarios')
      .select('numero_registro, nombre_comercial, titular, materia_activa, estado')
      .textSearch('nombre_comercial', tsQuery)
      .limit(20);

    if (error) {
      // Si falla el textSearch (por caracteres especiales, etc), hacemos un fallback a ilike
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('productos_fitosanitarios')
        .select('numero_registro, nombre_comercial, titular, materia_activa, estado')
        .or(`nombre_comercial.ilike.%${query}%,materia_activa.ilike.%${query}%`)
        .limit(20);

      if (fallbackError) throw fallbackError;

      const results = fallbackData.map((p: any) => ({
        numRegistro: p.numero_registro,
        nombreComercial: p.nombre_comercial,
        titular: p.titular || 'Desconocido',
        materiaActiva: p.materia_activa || 'Desconocida',
        estado: p.estado || 'Vigente'
      }));

      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    const results = data.map((p: any) => ({
      numRegistro: p.numero_registro,
      nombreComercial: p.nombre_comercial,
      titular: p.titular || 'Desconocido',
      materiaActiva: p.materia_activa || 'Desconocida',
      estado: p.estado || 'Vigente'
    }));

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    console.error('Error fetching from MAPA db:', error);
    return NextResponse.json({ error: 'Fallo al conectar con la base de datos del Vademécum' }, { status: 500 });
  }
}
