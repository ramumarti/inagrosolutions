'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Mail, Server, User, Key, AtSign, Settings2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function EmailConfigPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [language, setLanguage] = useState<'en' | 'es'>('es');
  
  // SMTP Settings State
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [testRecipient, setTestRecipient] = useState('');
  
  // Status State
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  // User details for autofill
  const [adminMetadata, setAdminMetadata] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    const storedLang = localStorage.getItem('portal_language');
    if (storedLang === 'en' || storedLang === 'es') {
      setLanguage(storedLang);
    }

    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || '';
          const name = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
          setTestRecipient(email);
          setAdminMetadata({ email, name });
          
          if (!fromEmail) setFromEmail(email);
          if (!fromName) setFromName(name);
        }

        const { data: settings } = await supabase
          .from('smtp_settings')
          .select('*')
          .single();

        if (settings) {
          setHost(settings.host || '');
          setPort(settings.port?.toString() || '587');
          setUsername(settings.username || '');
          setFromEmail(settings.from_email || '');
          setFromName(settings.from_name || '');
          setIsVerified(settings.is_verified || false);
          setVerifiedAt(settings.verified_at || null);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const handleTestEmail = async () => {
    if (!host || !port || !username || (!password && !isVerified) || !fromEmail || !fromName || !testRecipient) {
      toast(
        language === 'en' ? 'Please fill all required fields.' : 'Por favor completa todos los campos requeridos.',
        'error'
      );
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host,
          port: parseInt(port),
          username,
          password,
          from_email: fromEmail,
          from_name: fromName,
          test_recipient: testRecipient
        })
      });

      const data = await response.json();

      if (data.success) {
        toast(
          language === 'en' 
            ? 'Email sent successfully and settings saved. Check your inbox.' 
            : 'Email enviado exitosamente y configuración guardada. Revisa tu bandeja de entrada.',
          'success'
        );
        setIsVerified(true);
        setVerifiedAt(new Date().toISOString());
        setPassword(''); 
      } else {
        toast(
          data.message || (language === 'en' ? 'SMTP test failed.' : 'Prueba SMTP fallida.'),
          'error'
        );
      }
    } catch (error: any) {
      toast(
        error.message || (language === 'en' ? 'Error connecting to the server.' : 'Error contactando al servidor.'),
        'error'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const autofillProvider = (provider: 'sendgrid' | 'gmail' | 'mailgun' | 'ses') => {
    if (!adminMetadata) return;

    if (!fromEmail) setFromEmail(adminMetadata.email);
    if (!fromName) setFromName(adminMetadata.name);

    if (provider === 'sendgrid') {
      setHost('smtp.sendgrid.net');
      setPort('587');
      setUsername('apikey');
    } else if (provider === 'gmail') {
      setHost('smtp.gmail.com');
      setPort('587');
      setUsername(adminMetadata.email);
    } else if (provider === 'mailgun') {
      setHost('smtp.mailgun.org');
      setPort('587');
      setUsername(adminMetadata.email);
    } else if (provider === 'ses') {
      setHost('email-smtp.us-east-1.amazonaws.com');
      setPort('587');
      setUsername(adminMetadata.email);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {language === 'en' ? 'Email Configuration' : 'Configuración de Email'}
        </h1>
        <p className="text-slate-400">
          {language === 'en' 
            ? 'Configure your SMTP settings to enable welcome emails and notifications' 
            : 'Configura tu SMTP para habilitar emails de bienvenida y notificaciones'}
        </p>
      </div>

      {isVerified ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-200 text-sm font-medium">
            {language === 'en' 
              ? `✅ SMTP Configured and Verified — Last checked: ${new Date(verifiedAt!).toLocaleDateString()}` 
              : `✅ SMTP Configurado y Verificado — Última verificación: ${new Date(verifiedAt!).toLocaleDateString()}`}
          </span>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span className="text-amber-200 text-sm font-medium">
            {language === 'en' 
              ? '⚠️ SMTP Not Configured — Welcome emails are disabled' 
              : '⚠️ SMTP No Configurado — Los emails de bienvenida están desactivados'}
          </span>
        </div>
      )}

      <GlassCard className="!max-w-4xl !p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            {language === 'en' ? 'SMTP Settings' : 'Configuración SMTP'}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => autofillProvider('sendgrid')}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/25 transition-colors"
            >
              SendGrid
            </button>
            <button 
              onClick={() => autofillProvider('gmail')}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/25 transition-colors"
            >
              Gmail SMTP
            </button>
            <button 
              onClick={() => autofillProvider('mailgun')}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/25 transition-colors"
            >
              Mailgun
            </button>
            <button 
              onClick={() => autofillProvider('ses')}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/25 transition-colors"
            >
              Amazon SES
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Host</label>
            <Input
              value={host}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setHost(e.target.value); setIsVerified(false); }}
              placeholder="smtp.example.com"
              icon={<Server className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              {language === 'en' ? 'Port' : 'Puerto'}
            </label>
            <Input
              value={port}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPort(e.target.value); setIsVerified(false); }}
              placeholder="587"
              type="number"
              icon={<Server className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              {language === 'en' ? 'Username' : 'Usuario'}
            </label>
            <Input
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setUsername(e.target.value); setIsVerified(false); }}
              placeholder="apikey"
              icon={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-1.5">
             <label className="block text-sm font-medium text-slate-300">
              {language === 'en' ? 'Password' : 'Clave SMTP'}
            </label>
            <Input
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); setIsVerified(false); }}
              placeholder={isVerified ? "••••••••" : "Tu clave SMTP..."}
              type="password"
              icon={<Key className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              {language === 'en' ? 'From Email' : 'Email Remitente'}
            </label>
            <Input
              value={fromEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFromEmail(e.target.value); setIsVerified(false); }}
              placeholder="noreply@sudominio.com"
              type="email"
              icon={<AtSign className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              {language === 'en' ? 'From Name' : 'Nombre Remitente'}
            </label>
            <Input
              value={fromName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFromName(e.target.value); setIsVerified(false); }}
              placeholder="IASOLUTIONS"
              icon={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-4">
            {language === 'en' ? 'Test & Save Configuration' : 'Probar y Guardar Configuración'}
          </h3>
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                {language === 'en' ? 'Test Email Recipient' : 'Destinatario de Prueba'}
              </label>
              <Input
                value={testRecipient}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestRecipient(e.target.value)}
                placeholder="admin@example.com"
                type="email"
                icon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="w-full md:w-auto">
              <GlowButton
                onClick={handleTestEmail}
                variant="primary"
                disabled={isTesting}
                className="w-full md:w-auto"
              >
                {isTesting 
                  ? (language === 'en' ? 'Testing...' : 'Probando...') 
                  : (language === 'en' ? '🧪 Send Test Email' : '🧪 Enviar Email de Prueba')}
              </GlowButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
