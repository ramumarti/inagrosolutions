import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canUseAIFeature, consumeCredits } from '@/lib/ai-credits';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');
const MODEL_NAME = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { producto_nombre, producto_registro, cultivo, dosis, unidad_dosis } = await req.json();

    if (!producto_nombre && !producto_registro) {
      return NextResponse.json({ error: 'Faltan datos del producto' }, { status: 400 });
    }

    // 1. Intentar validar contra base de datos local (gratis, rápido)
    let dbProduct = null;
    if (producto_registro) {
      const { data } = await supabase.from('productos_fitosanitarios').select('*').eq('numero_registro', producto_registro).single();
      dbProduct = data;
    } else {
      // Buscar por nombre
      const { data } = await supabase.from('productos_fitosanitarios')
        .select('*')
        .textSearch('nombre_comercial', producto_nombre.split(' ').join(' & '))
        .limit(1)
        .single();
      dbProduct = data;
    }

    if (dbProduct) {
      const result = await validateLocally(dbProduct, { cultivo, dosis, unidad_dosis });
      // Si la validación local funciona perfectamente y no hay dudas, devolvemos sin cobrar crédito
      if (result.confidence === 'high') {
        return NextResponse.json(result);
      }
    }

    // 2. Si no está en BD o hay dudas, usar Gemini IA (consume crédito)
    const { allowed, upgradeMessage } = await canUseAIFeature(user.id, 'vademecum_validate');
    if (!allowed) {
      // Devolvemos lo que tengamos de BD local, aunque sea poco fiable
      return NextResponse.json({ 
        valid: true, 
        warnings: ['Producto no encontrado en BD local. IA no disponible por falta de créditos.'], 
        errors: [], 
        info: {} 
      });
    }

    const startTime = Date.now();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
Eres un inspector del MAPA de España experto en Vademécum de productos fitosanitarios.
Verifica la legalidad y seguridad de este tratamiento agrícola:
- Producto: ${producto_nombre || 'Desconocido'} (Registro: ${producto_registro || 'Desconocido'})
- Cultivo/Aplicación: ${cultivo || 'Desconocido'}
- Dosis intentada: ${dosis} ${unidad_dosis}

Devuelve SOLO un JSON con esta estructura:
{
  "valid": boolean (false si es ilegal o muy peligroso),
  "warnings": [string] (avisos importantes, ej: "revisar plazo de seguridad"),
  "errors": [string] (razones si valid=false, ej: "Producto cancelado", "Dosis excede el máximo de X L/ha", "No autorizado para este cultivo"),
  "info": {
    "dosis_maxima_legal": number o null,
    "plazo_seguridad_dias": number o null,
    "materia_activa": string
  }
}
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    let jsonResult;
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      jsonResult = JSON.parse(match ? match[1] : text);
    } catch (e) {
      throw new Error("Respuesta inválida de IA");
    }

    // Consumir crédito
    await consumeCredits(user.id, 'vademecum_validate', {
      input_summary: `Validación ${producto_nombre} en ${cultivo}`,
      response_time_ms: Date.now() - startTime
    });

    return NextResponse.json({ ...jsonResult, source: 'ai' });

  } catch (error: any) {
    console.error('Error in validate-treatment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function validateLocally(dbProduct: any, input: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (dbProduct.estado && dbProduct.estado.toLowerCase() !== 'vigente') {
    errors.push(`El producto se encuentra en estado: ${dbProduct.estado}. No se permite su uso.`);
  }

  if (input.cultivo && dbProduct.cultivos_autorizados && dbProduct.cultivos_autorizados.length > 0) {
    const isAllowed = dbProduct.cultivos_autorizados.some((c: string) => 
      c.toLowerCase().includes(input.cultivo.toLowerCase()) || 
      input.cultivo.toLowerCase().includes(c.toLowerCase())
    );
    if (!isAllowed) {
      errors.push(`El cultivo '${input.cultivo}' no está en la lista de autorizados para este producto.`);
    }
  } else {
    warnings.push("No se pudo verificar el cultivo de forma concluyente.");
  }

  if (input.dosis && dbProduct.dosis_maxima) {
    // Normalizar si es necesario
    if (Number(input.dosis) > Number(dbProduct.dosis_maxima)) {
      errors.push(`La dosis indicada (${input.dosis} ${input.unidad_dosis}) excede la dosis máxima permitida (${dbProduct.dosis_maxima} ${dbProduct.unidad_dosis}).`);
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    info: {
      dosis_maxima_legal: dbProduct.dosis_maxima,
      plazo_seguridad_dias: dbProduct.plazo_seguridad_dias,
      materia_activa: dbProduct.materia_activa
    },
    confidence: warnings.length === 0 ? 'high' : 'medium',
    source: 'db'
  };
}
