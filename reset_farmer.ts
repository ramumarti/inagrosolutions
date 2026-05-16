import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetFarmerPassword() {
  // Buscar el UUID del usuario por email
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) { console.error('Error:', error); return; }

  const farmer = users.find(u => u.email === 'ramumarti+4p1@gmail.com');
  if (!farmer) { console.log('Usuario no encontrado'); return; }

  console.log('Encontrado usuario:', farmer.email, 'ID:', farmer.id);

  // Resetear contraseña
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    farmer.id,
    { password: 'Test1234!' }
  );

  if (updateError) {
    console.error('Error al resetear:', updateError);
  } else {
    console.log('✅ Contraseña reseteada. Nueva contraseña: Test1234!');
  }
}

resetFarmerPassword();
