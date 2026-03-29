import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { buildEmailTemplate } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { host, port, username, password, from_email, from_name, test_recipient } = body;

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: existing } = await supabaseAdmin.from('smtp_settings').select('id, password').single();

    let cleanPassword = password ? password.replace(/\s+/g, '') : '';
    if (!cleanPassword && existing?.password) {
      cleanPassword = existing.password;
    }

    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      auth: {
        user: username,
        pass: cleanPassword,
      },
    });

    const html = buildEmailTemplate({
      title: '✅ Test Email',
      greeting: 'Hola,',
      bodyLines: ['Tu configuración SMTP está funcionando correctamente.'],
      footerText: 'Test SMTP Message'
    });

    const info = await transport.sendMail({
      from: from_name ? `"${from_name}" <${from_email}>` : from_email,
      to: test_recipient,
      subject: '✅ Test Email — SMTP Configuration Working',
      html,
    });

    if (existing) {
      await supabaseAdmin.from('smtp_settings').update({
        host,
        port: Number(port),
        username,
        password: cleanPassword,
        from_email,
        from_name,
        is_verified: true,
        verified_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('smtp_settings').insert({
        host,
        port: Number(port),
        username,
        password: cleanPassword,
        from_email,
        from_name,
        is_verified: true,
        verified_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent and settings saved', 
      smtp_response: info.response 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Unknown SMTP error',
      error_code: error.code
    }, { status: 400 });
  }
}
