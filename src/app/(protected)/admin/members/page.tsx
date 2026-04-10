"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Search, 
  Calendar, 
  Shield, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Map,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  platform_role: string;
  total_hectareas: number;
  created_at: string;
  is_active: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  accepted_at: string | null;
}

export default function MembersPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { t, language } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    if (!tenant) return;
    setLoading(true);

    // Fetch active members
    const { data: membersData, error: membersError } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    // Fetch pending invitations
    const { data: inviteData, error: inviteError } = await supabase
      .from('tenant_invitations')
      .select('*')
      .eq('tenant_id', tenant.id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (!membersError) setMembers(membersData || []);
    if (!inviteError) setInvitations(inviteData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [tenant]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !tenant) return;
    setInviting(true);

    try {
      // Inserción en tabla de invitaciones
      const { error } = await supabase
        .from('tenant_invitations')
        .insert({
          tenant_id: tenant.id,
          email: inviteEmail.toLowerCase(),
          role: 'farmer'
        });

      if (error) throw error;

      // Disparar envío de email (Usaremos la API que creamos)
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: inviteEmail, 
          tenantName: tenant.name,
          logoUrl: tenant.logo_url
        })
      });

      if (!res.ok) console.warn('Email invitation failed but database entry created');

      toast(language === 'en' ? 'Invitation sent successfully' : 'Invitación enviada correctamente', 'success');
      setInviteEmail('');
      fetchMembers();
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Cargando gestión de socios...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black glow-text flex items-center gap-3">
            <Users className="w-10 h-10 text-[var(--color-primary)]" />
            {language === 'en' ? 'Member Management' : 'Gestión de Socios'}
          </h1>
          <p className="text-white/60 font-medium">
            {language === 'en' 
              ? `Managing network for ${tenant?.name}` 
              : `Gestionando la red de ${tenant?.name}`}
          </p>
        </div>

        <div className="flex gap-4">
           <GlassCard className="px-6 py-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest">{language === 'en' ? 'Total Farmers' : 'Socios Activos'}</p>
                <p className="text-2xl font-black">{members.length}</p>
              </div>
           </GlassCard>
           <GlassCard className="px-6 py-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Map size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest">{language === 'en' ? 'Hectares' : 'Total Hectáreas'}</p>
                <p className="text-2xl font-black">
                  {members.reduce((acc, current) => acc + (current.total_hectareas || 0), 0).toFixed(1)}
                </p>
              </div>
           </GlassCard>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder={language === 'en' ? 'Search by name or email...' : 'Buscar por nombre o email...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="px-6 py-4">{language === 'en' ? 'Member' : 'Socio'}</th>
                    <th className="px-6 py-4">{language === 'en' ? 'Status' : 'Estado'}</th>
                    <th className="px-6 py-4">{language === 'en' ? 'Joined' : 'Alta'}</th>
                    <th className="px-6 py-4">{language === 'en' ? 'Volume' : 'Volumen'}</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-[var(--color-primary)]">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-white/40">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase">
                          <CheckCircle2 size={12} />
                          {language === 'en' ? 'Active' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-white/60">
                         {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-sm font-black">{member.total_hectareas || 0} ha</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Invitaciones Pendientes */}
                  {invitations.map((invite) => (
                    <tr key={invite.id} className="bg-amber-500/[0.02] border-l-2 border-amber-500/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Mail size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm italic">{invite.email}</p>
                            <p className="text-[10px] uppercase font-bold tracking-tighter">Pendiente de registro</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-extrabold uppercase animate-pulse">
                          <Clock size={12} />
                          Enviada
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-white/30">
                        {new Date(invite.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">—</td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-[10px] font-bold text-amber-400/50 hover:text-amber-400">Recordar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {loading && <div className="p-10 text-center text-white/20 animate-pulse">Buscando en la base de datos...</div>}
              {!loading && members.length === 0 && invitations.length === 0 && (
                <div className="p-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                     <Users size={32} />
                   </div>
                   <p className="text-white/40 font-medium">Aún no tienes socios registrados en tu cooperativa.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Invite */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              {language === 'en' ? 'Invite Farmer' : 'Invitar Agricultor'}
            </h2>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              {language === 'en'
                ? 'Send an invitation link so they can join your cooperative and start managing their plots.'
                : 'Envía un enlace de invitación para que se unan a tu cooperativa y empiecen a gestionar sus parcelas.'}
            </p>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="email@agricultor.com" 
                  icon={<Mail className="w-4 h-4" />}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <GlowButton 
                type="submit" 
                className="w-full py-4 rounded-xl"
                isLoading={inviting}
              >
                {language === 'en' ? 'Send Invitation' : 'Enviar Invitación'}
              </GlowButton>
            </form>

            <div className="mt-6 flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
               <Shield size={20} className="text-emerald-400 shrink-0 mt-0.5" />
               <p className="text-[10px] text-white/40 leading-normal italic">
                 {language === 'en'
                   ? 'The farmer will receive a white-label email with your brand (logo and colors) to ensure trust and professional relationship.'
                   : 'El agricultor recibirá un email de marca blanca con tu identidad corporativa (logo y colores), transmitiendo confianza y profesionalidad.'}
               </p>
            </div>
          </GlassCard>
          
          {/* Quick Help */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-black uppercase text-white/40 tracking-widest mb-4">Ayuda rápida</h3>
            <ul className="space-y-3">
               {[
                 { title: '¿Cómo se cobran mis socios?', desc: 'Tus socios pagarán a través de la pasarela de pagos que configures.' },
                 { title: '¿Puedo quitar a un socio?', desc: 'Sí, puedes desactivar el acceso de cualquier socio en cualquier momento.' },
                 { title: '¿Ven mis otros socios?', desc: 'No, los datos están aislados. Un socio solo ve sus propias fincas.' }
               ].map((q, i) => (
                 <li key={i} className="group cursor-help">
                    <p className="text-xs font-bold text-white/80 group-hover:text-[var(--color-primary)] transition-colors">{q.title}</p>
                    <p className="text-[10px] text-white/40">{q.desc}</p>
                 </li>
               ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
