const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cezsxcrazgskecrisaas.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlenN4Y3Jhemdza2VjcmlzYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzM0MzIsImV4cCI6MjA4OTk0OTQzMn0.5c7jLg2St2s04WY-hQw_dUnVcRBmziCXt0qr61pT684';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStripe() {
  console.log('1. Creando usuario de prueba...');
  const email = `test_stripe_${Date.now()}@example.com`;
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'TestPassword123!',
  });

  if (authError || !authData.session) {
    console.error('No se pudo crear usuario (quizá requiere verificación de email). Intentaremos iniciar sesión si existe o la sesión es null:', authError);
    // Si requiere verificación, no tendremos sesión. Vamos a intentar hacer login con una cuenta falsa o devolver error.
    if (!authData.session) {
       console.log("Supabase requiere confirmación de correo. No podemos obtener el JWT automáticamente.");
       return;
    }
  }

  const token = authData.session.access_token;
  console.log('2. Llamando al endpoint de Stripe en producción con el token JWT...');

  const response = await fetch('https://www.inagrosolutions.com/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Next.js Auth Helpers usually read cookies, but let's see if the server route uses cookies or headers.
    },
    body: JSON.stringify({
      plan: 'basico',
      interval: 'month'
    })
  });

  const responseData = await response.json();
  console.log('3. Respuesta de Vercel/Stripe:');
  console.log('Status:', response.status);
  console.log('Data:', responseData);
}

testStripe();
