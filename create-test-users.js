const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  const testUsers = [
    { email: 'superadmin@inagrosolutions.com', password: 'Password123!', role: 'superadmin', name: 'SuperAdmin' },
    { email: 'admin@cooperativalaguna.com', password: 'Password123!', role: 'tenant_admin', name: 'Admin Coop' },
    { email: 'juan.agricultor@gmail.com', password: 'Password123!', role: 'farmer', name: 'Juan Agricultor' }
  ];

  for (const u of testUsers) {
    console.log(`Intentando crear: ${u.email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { first_name: u.name, platform_role: u.role }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`[INFO] El usuario ${u.email} ya existe. Actualizando su rol a ${u.role}...`);
        const { data: existUser } = await supabase.auth.admin.listUsers();
        const found = existUser?.users.find(x => x.email === u.email);
        if (found) {
          await supabase.from('users').update({ platform_role: u.role }).eq('id', found.id);
        }
      } else {
        console.error(`[ERROR] No se pudo crear ${u.email}:`, authError.message);
      }
    } else {
      console.log(`[EXITO] Creado: ${u.email}`);
      if (authData?.user) {
        await new Promise(r => setTimeout(r, 1000));
        await supabase.from('users').update({ platform_role: u.role, first_name: u.name }).eq('id', authData.user.id);
      }
    }
  }
  console.log('Proceso finalizado.');
}

createUsers();
