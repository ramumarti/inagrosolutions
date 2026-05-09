import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const mainDomain = 'inagrosolutions.com'; // Dominio principal plataforma

  // Ejecutamos la autenticación y refresco de sesión
  let response = await updateSession(request);

  // Paso 2.5: Detección de Dominio Personalizado
  if (host !== mainDomain && !host.includes('localhost') && !host.includes('vercel.app')) {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
     try {
       // Consulta REST ultrarrápida al Edge para no penalizar latencia
       const res = await fetch(`${supabaseUrl}/rest/v1/tenants?custom_domain=eq.${host}&select=slug,show_public_page`, {
         headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
       });
       if (res.ok) {
         const data = await res.json();
         if (data && data.length > 0) {
           const tenant = data[0];
           // Si visitan la raíz del dominio personalizado, reescribimos internamente a su Landing Page
           if (url.pathname === '/' && tenant.show_public_page !== false) {
             const rewriteRes = NextResponse.rewrite(new URL(`/c/${tenant.slug}`, request.url));
             // Preservamos las cookies de sesión gestionadas por updateSession
             response.cookies.getAll().forEach(c => rewriteRes.cookies.set(c.name, c.value));
             return rewriteRes;
           }
         }
       }
     } catch (e) {
       console.error("Custom domain lookup error:", e);
     }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
