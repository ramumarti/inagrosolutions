import { NextRequest, NextResponse } from 'next/server';

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
    // ----------------------------------------------------------------------------------
    // TODO: Conectar con el WebService / Origen Oficial del MAPA
    // Muchos agricultores utilizan la descarga CSV/XML masiva del ministerio
    // o APIs de terceros. Por problemas de CORS con el SOAP oficial, se hace desde el backend.
    // ----------------------------------------------------------------------------------
    
    // MOCK DATA: Respuestas estructuradas simulando la base de datos oficial del MAPA.
    const mockDatabase: ProductoMAPA[] = [
      { numRegistro: '12345', nombreComercial: 'GLIFOSATO 36%', titular: 'AgroQuímica SL', materiaActiva: 'Glifosato', estado: 'Vigente' },
      { numRegistro: '24680', nombreComercial: 'ABAMECTINA 1.8%', titular: 'BioPesticidas SA', materiaActiva: 'Abamectina', estado: 'Vigente' },
      { numRegistro: '13579', nombreComercial: 'COBRE 50%', titular: 'EcoFert SL', materiaActiva: 'Oxicloruro de cobre', estado: 'Vigente' },
      { numRegistro: '98765', nombreComercial: 'AZUFRE 80%', titular: 'QuimicaAgricola', materiaActiva: 'Azufre', estado: 'Vigente' }
    ];

    const results = mockDatabase.filter(p => 
      p.nombreComercial.toLowerCase().includes(query.toLowerCase()) || 
      p.materiaActiva.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error fetching from MAPA:', error);
    return NextResponse.json({ error: 'Fallo al conectar con el servidor del MAPA' }, { status: 500 });
  }
}
