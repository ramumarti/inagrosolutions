import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transcribeAudioToJSON } from '@/lib/gemini-multimodal';
import { canUseAIFeature, consumeCredits } from '@/lib/ai-credits';

export const maxDuration = 60; // Permitir hasta 60s para procesamiento de audio

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Verificar créditos
    const { allowed, upgradeMessage } = await canUseAIFeature(user.id, 'voice_entry');
    if (!allowed) {
      return NextResponse.json({ error: 'CREDITS_EXHAUSTED', message: upgradeMessage }, { status: 403 });
    }

    // 2. Extraer datos del request
    const body = await req.json();
    const { audioBase64, mimeType, type } = body;

    if (!audioBase64 || !mimeType) {
      return NextResponse.json({ error: 'Audio o mimeType no proporcionado' }, { status: 400 });
    }

    // 3. Seleccionar el prompt adecuado según el tipo de registro
    let promptContext = '';
    
    if (type === 'tratamiento') {
      promptContext = `
Eres un asistente agrícola español experto en cuadernos de campo SIEX.
El agricultor ha dictado la siguiente nota de voz para registrar un Tratamiento Fitosanitario.
Extrae los datos en formato JSON.

Devuelve SOLO un JSON con esta estructura (los valores que no encuentres ponlos a null):
{
  "parcela": string, // Nombre o identificador de la parcela
  "fecha": "YYYY-MM-DD", // Fecha de la actividad (infiere de "ayer", "hoy", etc.)
  "producto": string, // Nombre del producto o materia activa
  "dosis": number,
  "unidad_dosis": "L/ha" | "kg/ha" | "mL/ha" | "g/ha" | "L/hl" | "kg/hl",
  "superficie_tratada": number, // en hectáreas
  "maquinaria": string,
  "operario": string,
  "justificacion": string,
  "enfermedad_plaga": string,
  "confianza": number // del 0 al 100 de seguridad en la extracción
}
`;
    } else if (type === 'labor') {
      promptContext = `
Eres un asistente agrícola español experto en cuadernos de campo SIEX.
El agricultor ha dictado la siguiente nota de voz para registrar una Labor Cultural (poda, recolección, riego, laboreo).
Extrae los datos en formato JSON.

Devuelve SOLO un JSON con esta estructura (los valores que no encuentres ponlos a null):
{
  "parcela": string,
  "fecha": "YYYY-MM-DD",
  "tipo_labor": string, // Ej: "Poda", "Laboreo", "Recolección"
  "maquinaria": string,
  "operario": string,
  "superficie": number,
  "observaciones": string,
  "confianza": number
}
`;
    } else if (type === 'fertilizacion') {
      promptContext = `
Eres un asistente agrícola español experto en cuadernos de campo SIEX.
El agricultor ha dictado la siguiente nota de voz para registrar una Aplicación de Fertilizantes.
Extrae los datos en formato JSON.

Devuelve SOLO un JSON con esta estructura (los valores que no encuentres ponlos a null):
{
  "parcela": string,
  "fecha": "YYYY-MM-DD",
  "fertilizante": string, // Nombre del abono
  "dosis": number,
  "unidad_dosis": "kg/ha" | "L/ha" | "t/ha",
  "superficie_tratada": number,
  "maquinaria": string,
  "operario": string,
  "confianza": number
}
`;
    } else {
      return NextResponse.json({ error: 'Tipo de registro no soportado' }, { status: 400 });
    }

    const startTime = Date.now();
    
    // 4. Llamar a Gemini Multimodal
    const extractedData = await transcribeAudioToJSON(audioBase64, mimeType, promptContext);
    
    const responseTime = Date.now() - startTime;

    // 5. Consumir créditos
    await consumeCredits(user.id, 'voice_entry', {
      input_summary: `Audio (${mimeType}) para ${type}`,
      response_time_ms: responseTime,
      success: true
    });

    return NextResponse.json(extractedData);
    
  } catch (error: any) {
    console.error("Error en voice-entry route:", error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
