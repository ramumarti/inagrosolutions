import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const mainDomain = 'inagrosolutions.es'; // Dominio principal plataforma

  // Paso 2.5: Detección de Dominio Personalizado
  // Si el host no es el principal y no es localhost, intentamos detectar si es un tenant
  if (host !== mainDomain && !host.includes('localhost') && !host.includes('vercel.app')) {
     // Aquí normalmente haríamos una búsqueda en caché/DB
     // Por ahora, simulamos o dejamos pasar si no hay mapping dinámico implementado
     // Pero la infraestructura queda lista para:
     // return NextResponse.rewrite(new URL(`/c/${slug}${url.pathname}`, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
