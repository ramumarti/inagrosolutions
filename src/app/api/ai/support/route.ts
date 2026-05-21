import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, history, userRole } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemInstruction = "";

    if (userRole === 'farmer') {
      systemInstruction = `Eres "Ayuda", el asistente de soporte amigable de InagroSolutions.
Estás hablando con un agricultor. Tus respuestas deben ser breves, claras y sin jerga técnica.
Ayúdale a encontrar opciones como 'Anotar Tratamientos', 'Escanear Facturas', o explícale cómo exportar el Excel del cuaderno SIEX. No divagues.`;
    } else if (userRole === 'tenant_admin') {
      systemInstruction = `Eres "Ayuda", el asistente de soporte técnico de InagroSolutions.
Estás hablando con el Administrador de una Entidad/Cooperativa.
Responde dudas sobre cómo dar de alta agricultores, cómo funciona el Dashboard, cómo cambiar su Marca Blanca, los pagos o cómo funciona el Cuaderno SIEX para supervisar socios.`;
    } else {
      systemInstruction = `Eres "Ayuda", asistente de InagroSolutions. Responde de forma clara y directa a dudas sobre el software.`;
    }

    const promptContext = `
Instrucciones Sistema: ${systemInstruction}
Mensajes previos: ${JSON.stringify(history.slice(-4))}
Pregunta actual: ${message}

Responde de manera concisa:`;

    const result = await model.generateContent(promptContext);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    console.error("Error en AI Support API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
