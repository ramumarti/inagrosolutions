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
  Users, 
  UserPlus, 
  Search, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  Phone,
  CreditCard,
  Briefcase,
  Activity,
  UserCheck
} from 'lucide-react';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '@/lib/actions/resources';

interface Worker {
  id: string;
  nombre: string;
  nif: string;
  telefono: string;
  especialidad: string;
  coste_hora: number;
  carnet_ropo: string;
  is_active: boolean;
}

export default function WorkersPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const { toast } = useToast();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<any>({
    nombre: '',
    nif: '',
    telefono: '',
    especialidad: '',
    coste_hora: 0,
    carnet_ropo: ''
  });

  const fetchWorkers = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const data = await getWorkers();
      setWorkers(data || []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [tenant]);

  const handleOpenModal = (worker: Worker | null = null) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        nombre: worker.nombre,
        nif: worker.nif || '',
        telefono: worker.telefono || '',
        especialidad: worker.especialidad || '',
        coste_hora: worker.coste_hora || 0,
        carnet_ropo: worker.carnet_ropo || ''
      });
    } else {
      setEditingWorker(null);
      setFormData({
        nombre: '',
        nif: '',
        telefono: '',
        especialidad: '',
        coste_hora: 0,
        carnet_ropo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, formData);
        toast(language === 'en' ? 'Worker updated' : 'Operario actualizado', 'success');
      } else {
        await createWorker(formData);
        toast(language === 'en' ? 'Worker created' : 'Operario creado', 'success');
      }
      setIsModalOpen(false);
      fetchWorkers();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'en' ? 'Delete this worker?' : '¿Eliminar este operario?')) {
      try {
        await deleteWorker(id);
        toast(language === 'en' ? 'Worker deleted' : 'Operario eliminado', 'success');
        fetchWorkers();
      } catch (e: any) {
        toast(e.message, 'error');
      }
    }
  };

  const filtered = workers.filter(w => 
    w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Cargando base de datos de operarios...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent p-8 rounded-3xl border border-[var(--color-primary)]/10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-[var(--color-primary)]/20 rounded-xl text-[var(--color-primary)]">
                <Users size={32} />
             </div>
             {language === 'en' ? 'Field Operators' : 'Gestión de Operarios'}
          </h1>
          <p className="text-white/60 font-medium ml-12">
            {language === 'en' ? 'Personnel allowed to sign notebooks' : 'Gestión y control del equipo humano operativo'}
          </p>
        </div>
        <GlowButton onClick={() => handleOpenModal()} className="px-6 py-3 rounded-2xl flex items-center gap-2">
           <UserPlus size={18} />
           {language === 'en' ? 'Add Operator' : 'Añadir Operario'}
        </GlowButton>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Operarios', val: workers.length, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'En Activo', val: workers.filter(w => w.is_active).length, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Especialidades', val: new Set(workers.map(w => w.especialidad)).size, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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

      {/* Table Section */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search by name...' : 'Buscar operario...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40">
              <tr>
                <th className="px-6 py-5">Nombre y NIF</th>
                <th className="px-6 py-5">Especialidad</th>
                <th className="px-6 py-5">Contacto</th>
                <th className="px-6 py-5">ROPO</th>
                <th className="px-6 py-5 text-right font-black">Coste/H</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20">
                          {w.nombre[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="font-bold text-white leading-none mb-1">{w.nombre}</p>
                          <p className="text-[10px] font-bold text-white/30 tracking-widest">{w.nif || 'SIN DNI'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 uppercase tracking-tighter">
                      {w.especialidad || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-white/60">
                       <Phone size={14} />
                       <span className="text-sm font-medium">{w.telefono || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-black text-white/20 uppercase font-mono tracking-widest truncate max-w-[120px]">
                      {w.carnet_ropo || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <p className="text-lg font-black text-white">{w.coste_hora || 0}<span className="text-[10px] font-medium text-white/30 ml-0.5">€/h</span></p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(w)} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && <div className="p-10 text-center animate-pulse text-white/20">Sincronizando plantilla...</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/5">
                 <Users size={32} />
               </div>
               <p className="text-white/40 font-medium">No se han encontrado operarios con esos criterios.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingWorker ? (language === 'en' ? 'Edit Operator' : 'Editar Operario') : (language === 'en' ? 'Add New Operator' : 'Nuevo Operario')}
      >
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
           <div className="space-y-4">
              <Input 
                 placeholder={language === 'en' ? 'Full Name' : 'Nombre Completo'}
                 value={formData.nombre}
                 onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                 icon={<Users className="w-4 h-4" />}
                 required
              />
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                   placeholder="DNI / NIF"
                   value={formData.nif}
                   onChange={(e) => setFormData({...formData, nif: e.target.value})}
                   icon={<CreditCard className="w-4 h-4" />}
                 />
                 <Input 
                   placeholder={language === 'en' ? 'Phone' : 'Teléfono'}
                   value={formData.telefono}
                   onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                   icon={<Phone className="w-4 h-4" />}
                 />
              </div>
              <Input 
                 placeholder={language === 'en' ? 'Specialty (Pruning, Treatment, etc)' : 'Especialidad'}
                 value={formData.especialidad}
                 onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                 icon={<Briefcase className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                   placeholder="Carnet ROPO"
                   value={formData.carnet_ropo}
                   onChange={(e) => setFormData({...formData, carnet_ropo: e.target.value})}
                   icon={<Activity className="w-4 h-4" />}
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
                 {editingWorker ? (language === 'en' ? 'Update' : 'Actualizar') : (language === 'en' ? 'Save' : 'Guardar')}
              </GlowButton>
           </div>
        </form>
      </Modal>
    </div>
  );
}
