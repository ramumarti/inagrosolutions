import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeImageWithGemini } from '@/lib/gemini-multimodal';
import { canUseAIFeature, consumeCredits } from '@/lib/ai-credits';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 1. Check créditos
    const { allowed, upgradeMessage } = await canUseAIFeature(user.id, 'scan_invoice');
    if (!allowed) {
      return NextResponse.json({ error: 'CREDITS_EXHAUSTED', message: upgradeMessage }, { status: 403 });
    }

    // 2. Extraer imagen
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Imagen no proporcionada' }, { status: 400 });
    }

    const startTime = Date.now();

    // 3. Prompt para Gemini Vision
    const prompt = `
Eres un asistente experto en contabilidad e inventario agrícola.
Analiza la siguiente imagen que es una factura o albarán de compra de suministros agrícolas (fitosanitarios, abonos, semillas, etc.).
Extrae los artículos comprados para añadirlos automáticamente al inventario del agricultor.

Devuelve SOLO un JSON con esta estructura exacta (si no encuentras algo, pon null):
{
  "proveedor": "Nombre de la tienda o cooperativa",
  "fecha": "YYYY-MM-DD",
  "total_factura": 0.00,
  "articulos": [
    {
      "nombre_producto": "Ej: Cobre Nordox 75 WG",
      "tipo": "fitosanitario | abono | semilla | otro",
      "cantidad": 0.00,
      "unidad": "L | kg | ud",
      "precio_unitario": 0.00,
      "numero_registro_mapa": "Si es un fitosanitario y aparece el número de registro"
    }
  ]
}
`;

    // 4. Llamar a Gemini Multimodal
    const extractedData = await analyzeImageWithGemini(imageBase64, mimeType, prompt);
    
    const responseTime = Date.now() - startTime;

    // 5. Consumir créditos
    await consumeCredits(user.id, 'scan_invoice', {
      input_summary: `Escáner factura (${mimeType})`,
      response_time_ms: responseTime,
      success: true
    });

    return NextResponse.json({ success: true, data: extractedData });
    
  } catch (error: any) {
    console.error('Error in scan-invoice route:', error);
    return NextResponse.json({ error: error.message || 'Error escaneando la factura' }, { status: 500 });
  }
}
