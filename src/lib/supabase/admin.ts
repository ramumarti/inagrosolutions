import { createClient } from '@supabase/supabase-js';

// NOTA: Este cliente debe usarse SOLO en archivos del lado del servidor (API Routes) 
// para evitar exponer la Service Role Key al navegador.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
