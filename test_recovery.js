const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cezsxcrazgskecrisaas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlenN4Y3Jhemdza2VjcmlzYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzM0MzIsImV4cCI6MjA4OTk0OTQzMn0.5c7jLg2St2s04WY-hQw_dUnVcRBmziCXt0qr61pT684'
);

async function test() {
  console.log('Sending recovery email...');
  const { data, error } = await supabase.auth.resetPasswordForEmail('ramumarti+oc300@gmail.com', {
    redirectTo: 'http://localhost:3000/auth/callback?next=/update-password',
  });
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
