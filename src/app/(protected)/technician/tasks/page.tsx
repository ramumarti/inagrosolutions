'use client';

import React, { useEffect, useState } from 'react';
import { getTenantTasks, updateTaskStatus, createTask } from '@/lib/actions/tasks';
import { getAssignedFarmers } from '@/lib/actions/technician';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newTask, setNewTask] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'general',
    prioridad: 'media',
    estado: 'pendiente',
    assigned_to: ''
  });

  const load = async () => {
    setLoading(true);
    const [t, f] = await Promise.all([getTenantTasks(), getAssignedFarmers()]);
    setTasks(t || []);
    setFarmers(f || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTaskStatus(id, newStatus);
      load();
    } catch (e) {
      console.error(e);
      alert('Error updating task');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.titulo || !newTask.assigned_to) return;
    try {
      await createTask(newTask);
      setNewTask({ ...newTask, titulo: '', descripcion: '' });
      setShowForm(false);
      load();
    } catch (e) {
      console.error(e);
      alert('Error creating task');
    }
  };

  const columns = [
    { id: 'pendiente', label: 'Pendientes', icon: Clock, color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
    { id: 'en_progreso', label: 'En Progreso', icon: PlayCircle, color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
    { id: 'completada', label: 'Completadas', icon: CheckCircle2, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  ];

  if (loading) return <div className="p-8 text-white/50 font-bold animate-pulse">Cargando tablero...</div>;

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-black text-white glow-text">Tablero de Tareas</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          {showForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva Tarea'}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-6 border-white/10 shrink-0">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full">
              <input type="text" placeholder="Título de la tarea" value={newTask.titulo} onChange={e => setNewTask({...newTask, titulo: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none" required />
            </div>
            <div className="col-span-full">
              <textarea placeholder="Descripción (opcional)" value={newTask.descripcion} onChange={e => setNewTask({...newTask, descripcion: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none min-h-[80px]" />
            </div>
            <select value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none" required>
              <option value="">Seleccione Agricultor</option>
              {farmers.map(f => <option key={f.id} value={f.id}>{f.email}</option>)}
            </select>
            <select value={newTask.tipo} onChange={e => setNewTask({...newTask, tipo: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none">
              <option value="general">General</option>
              <option value="tratamiento">Tratamiento Fitosanitario</option>
              <option value="fertilizacion">Fertilización</option>
              <option value="labor">Labor / Poda</option>
            </select>
            <select value={newTask.prioridad} onChange={e => setNewTask({...newTask, prioridad: e.target.value})} className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500/50 outline-none">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
            <div className="col-span-full flex justify-end">
              <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">Crear Tarea</button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.estado === col.id);
          const Icon = col.icon;
          return (
            <div key={col.id} className="flex flex-col h-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
              <div className={`p-4 border-b ${col.color} border-opacity-50 flex items-center gap-3 shrink-0`}>
                <Icon className="w-5 h-5" />
                <h3 className="font-bold text-white uppercase text-sm tracking-widest">{col.label}</h3>
                <span className="ml-auto bg-black/40 text-xs px-2 py-1 rounded-full font-bold">{colTasks.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                {colTasks.map(t => (
                  <GlassCard key={t.id} className="p-4 border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border 
                        ${t.prioridad === 'urgente' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                          t.prioridad === 'alta' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                          t.prioridad === 'media' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                          'bg-white/10 text-white/50 border-white/10'}
                      `}>{t.prioridad}</span>
                      <span className="text-[10px] text-white/40 font-mono capitalize">{t.tipo.replace('_', ' ')}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{t.titulo}</h4>
                    {t.descripcion && <p className="text-xs text-white/50 mb-3 line-clamp-2">{t.descripcion}</p>}
                    <div className="text-[10px] text-white/40 mt-3 pt-3 border-t border-white/5">
                      Para: <span className="text-white/70">{t.assigned_to?.email || 'Desconocido'}</span>
                    </div>

                    {/* Simple state mover for MVP */}
                    <div className="mt-3 flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.id !== 'pendiente' && <button onClick={() => handleStatusChange(t.id, 'pendiente')} className="flex-1 text-[10px] py-1 bg-white/5 hover:bg-white/10 rounded">⬅ P</button>}
                      {col.id !== 'en_progreso' && <button onClick={() => handleStatusChange(t.id, 'en_progreso')} className="flex-1 text-[10px] py-1 bg-white/5 hover:bg-white/10 rounded">▶ Prog</button>}
                      {col.id !== 'completada' && <button onClick={() => handleStatusChange(t.id, 'completada')} className="flex-1 text-[10px] py-1 bg-white/5 hover:bg-white/10 rounded">✔ Fin</button>}
                    </div>
                  </GlassCard>
                ))}
                {colTasks.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                    <span className="text-xs text-white/20 font-bold">Sin tareas</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
