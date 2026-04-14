"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { 
  Truck, 
  Settings, 
  Search, 
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Hash,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { getMachinery, createMachinery, updateMachinery, deleteMachinery } from '@/lib/actions/resources';
import { format } from 'date-fns';

interface Machinery {
  id: string;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  matricula: string;
  roma: string;
  iteaf_fecha: string;
  coste_hora: number;
  is_active: boolean;
}

export default function MachineryPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const { toast } = useToast();

  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machinery | null>(null);
  const [formData, setFormData] = useState<any>({
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    matricula: '',
    roma: '',
    iteaf_fecha: '',
    coste_hora: 0
  });

  const fetchMachinery = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const data = await getMachinery();
      setMachinery(data || []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, [tenant]);

  const handleOpenModal = (machine: Machinery | null = null) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({
        nombre: machine.nombre,
        tipo: machine.tipo || '',
        marca: machine.marca || '',
        modelo: machine.modelo || '',
        matricula: machine.matricula || '',
        roma: machine.roma || '',
        iteaf_fecha: machine.iteaf_fecha || '',
        coste_hora: machine.coste_hora || 0
      });
    } else {
      setEditingMachine(null);
      setFormData({
        nombre: '',
        tipo: '',
        marca: '',
        modelo: '',
        matricula: '',
        roma: '',
        iteaf_fecha: '',
        coste_hora: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await updateMachinery(editingMachine.id, formData);
        toast(language === 'en' ? 'Machinery updated' : 'Maquinaria actualizada', 'success');
      } else {
        await createMachinery(formData);
        toast(language === 'en' ? 'Machinery added' : 'Maquinaria añadida', 'success');
      }
      setIsModalOpen(false);
      fetchMachinery();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'en' ? 'Delete this machinery?' : '¿Eliminar esta máquina?')) {
      try {
        await deleteMachinery(id);
        toast(language === 'en' ? 'Machinery deleted' : 'Maquinaria eliminada', 'success');
        fetchMachinery();
      } catch (e: any) {
        toast(e.message, 'error');
      }
    }
  };

  const filtered = machinery.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (dateStr: string) => {
    if (!dateStr) return 'text-white/20 bg-white/5';
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return 'text-red-400 bg-red-500/10 border-red-500/20';
    const diff = (date.getTime() - now.getTime()) / (1000 * 3600 * 24);
    if (diff < 30) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Sincronizando garaje de maquinaria...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-500/10 to-transparent p-8 rounded-3xl border border-blue-500/10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                <Truck size={32} />
             </div>
             {language === 'en' ? 'Machinery Garage' : 'Gestión de Maquinaria'}
          </h1>
          <p className="text-white/60 font-medium ml-12">
            {language === 'en' ? 'Fleet management and ITEAF compliance' : 'Control de flota y calendarios de revisiones ITEAF'}
          </p>
        </div>
        <GlowButton onClick={() => handleOpenModal()} className="px-6 py-3 rounded-2xl flex items-center gap-2">
           <Zap size={18} />
           {language === 'en' ? 'Register Machine' : 'Añadir Máquina'}
        </GlowButton>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Unidades Totales', val: machinery.length, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Revisiones OK', val: machinery.filter(m => m.iteaf_fecha && new Date(m.iteaf_fecha) > new Date()).length, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Coste Promedio H', val: (machinery.reduce((acc, m) => acc + (m.coste_hora || 0), 0) / (machinery.length || 1)).toFixed(2) + '€', icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <GlassCard key={i} className="p-6 flex items-center gap-4">
             <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-white">{s.val}</p>
             </div>
          </GlassCard>
        ))}
      </div>

      {/* List Card */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search by name, brand or plate...' : 'Buscar maquinaria...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40">
              <tr>
                <th className="px-6 py-5">Identificación</th>
                <th className="px-6 py-5">Tipo y Marca</th>
                <th className="px-6 py-5">Matrícula / ROMA</th>
                <th className="px-6 py-5">Próxima ITEAF</th>
                <th className="px-6 py-5 text-right font-black">Coste/H</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{m.nombre}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter mt-1">{m.modelo || 'S/M'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/5 w-fit uppercase">
                         {m.tipo || 'General'}
                       </span>
                       <span className="text-xs font-bold text-white/40">{m.marca || 'Genérica'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <p className="text-sm font-black text-white/80">{m.matricula || '...'}</p>
                       <p className="text-[10px] font-medium text-white/30 uppercase">ROMA: {m.roma || '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {m.iteaf_fecha ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusColor(m.iteaf_fecha)}`}>
                         <Calendar size={12} />
                         {format(new Date(m.iteaf_fecha), 'dd/MM/yyyy')}
                      </span>
                    ) : (
                      <span className="text-white/10 text-[10px] font-bold uppercase italic">Sin revisión</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                     <p className="text-lg font-black text-white">{m.coste_hora || 0}<span className="text-[10px] font-medium text-white/30 ml-0.5">€/h</span></p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(m)} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && <div className="p-10 text-center animate-pulse text-white/20">Accediendo al registro...</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/5">
                 <Truck size={32} />
               </div>
               <p className="text-white/40 font-medium">No hay maquinaria registrada que coincida.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMachine ? (language === 'en' ? 'Edit Machinery' : 'Editar Máquina') : (language === 'en' ? 'New Machinery' : 'Nueva Máquina')}
      >
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
           <div className="space-y-4">
              <Input 
                 placeholder={language === 'en' ? 'Machine Name' : 'Nombre de la Máquina'}
                 value={formData.nombre}
                 onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                 icon={<Tag className="w-4 h-4" />}
                 required
              />
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                    placeholder="Marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    icon={<Truck className="w-4 h-4" />}
                 />
                 <Input 
                    placeholder="Modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    icon={<Settings className="w-4 h-4" />}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                   placeholder="Matrícula"
                   value={formData.matricula}
                   onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                   icon={<Hash className="w-4 h-4" />}
                 />
                 <Input 
                   placeholder="Nº ROMA"
                   value={formData.roma}
                   onChange={(e) => setFormData({...formData, roma: e.target.value})}
                   icon={<ShieldCheck className="w-4 h-4" />}
                 />
              </div>
              <Input 
                 placeholder="Tipo (Tractor, Atomizador, etc)"
                 value={formData.tipo}
                 onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                 icon={<Truck className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                   type="date"
                   placeholder="Próxima ITEAF"
                   value={formData.iteaf_fecha}
                   onChange={(e) => setFormData({...formData, iteaf_fecha: e.target.value})}
                   icon={<Calendar className="w-4 h-4" />}
                 />
                 <Input 
                   type="number"
                   step="0.01"
                   placeholder={language === 'en' ? 'Hourly Cost (€)' : 'Coste Hora (€)'}
                   value={formData.coste_hora}
                   onChange={(e) => setFormData({...formData, coste_hora: e.target.value})}
                   icon={<CreditCard className="w-4 h-4" />}
                 />
              </div>
           </div>
           
           <div className="flex gap-3 pt-4 border-t border-white/5">
              <GlowButton variant="secondary" className="flex-1 py-4 text-xs font-black uppercase tracking-widest" onClick={() => setIsModalOpen(false)}>
                 {language === 'en' ? 'Cancel' : 'Cancelar'}
              </GlowButton>
              <GlowButton type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest">
                 {editingMachine ? (language === 'en' ? 'Update' : 'Actualizar') : (language === 'en' ? 'Save' : 'Guardar')}
              </GlowButton>
           </div>
        </form>
      </Modal>
    </div>
  );
}
