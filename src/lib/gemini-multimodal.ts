import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  if (!process.env.GEMINI_KEY) {
    console.warn("Missing GEMINI_KEY environment variable. AI features will fail at runtime.");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_KEY || '');
};

// Usamos gemini-2.5-flash o gemini-2.0-flash para soporte multimodal (audio, imagen)
const MODEL_NAME = 'gemini-2.5-flash'; 

/**
 * Transcribe un archivo de audio y extrae datos estructurados usando Gemini Multimodal.
 * @param audioBase64 El contenido del audio codificado en Base64.
 * @param mimeType El tipo MIME del audio (ej. 'audio/webm', 'audio/mp3', 'audio/ogg').
 * @param promptContext El prompt que indica a Gemini qué extraer y en qué formato JSON.
 */
export async function transcribeAudioToJSON(
  audioBase64: string,
  mimeType: string,
  promptContext: string
): Promise<any> {
  const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });

  const audioPart = {
    inlineData: {
      data: audioBase64,
      mimeType,
    },
  };

  const result = await model.generateContent([
    { text: promptContext },
    audioPart
  ]);

  const responseText = result.response.text();
  return parseJSONResponse(responseText);
}

/**
 * Analiza una imagen y extrae datos estructurados usando Gemini Multimodal.
 * @param imageBase64 El contenido de la imagen codificado en Base64.
 * @param mimeType El tipo MIME de la imagen (ej. 'image/jpeg', 'image/png').
 * @param promptContext El prompt que indica a Gemini qué extraer y en qué formato JSON.
 */
export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string,
  promptContext: string
): Promise<any> {
  const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType,
    },
  };

  const result = await model.generateContent([
    { text: promptContext },
    imagePart
  ]);

  const responseText = result.response.text();
  return parseJSONResponse(responseText);
}

/**
 * Función de utilidad para limpiar la respuesta de Gemini y parsearla como JSON,
 * eliminando posibles bloques de código markdown (```json ... ```).
 */
function parseJSONResponse(text: string): any {
  try {
    // Buscar si Gemini devolvió el JSON envuelto en markdown
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    // Intentar parsear el texto completo si no hay bloques de markdown
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing Gemini JSON response:", text);
    throw new Error("La IA no devolvió un formato JSON válido.");
  }
}
