'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Leaf, ShieldCheck, Tractor, Star, Smartphone, Send, Loader2, Sparkles, Map, FileSpreadsheet, Check, CheckCircle2, ChevronRight, User, AlertTriangle, AlertCircle, TrendingUp, Cpu } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface FarmerDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  primaryColor: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PLAN_INFO = {
  basico: {
    name: 'Básico',
    ha: 'Hasta 5 HA',
    desc: 'Perfecto para pequeños agricultores que quieren cumplir la ley sin complicarse.',
    highlights: ['Registro SIEX obligado', 'Importación SIGPAC', 'Exportación legal Excel/PDF'],
  },
  intermedio: {
    name: 'Intermedio',
    ha: 'Hasta 20 HA',
    desc: 'Para explotaciones medianas que buscan la seguridad del Asistente Virtual 24/7.',
    highlights: ['Asistente Virtual CDC', 'Validación de dosis por IA', 'Control de ecorregímenes'],
  },
  avanzado: {
    name: 'Avanzado',
    ha: 'Hasta 50 HA',
    desc: 'Gestión profesional de maquinaria, operarios y estado de cultivos.',
    highlights: ['Gestión de Maquinaria', 'Control de Operarios/Equipos', 'Supervisión inteligente de cultivos'],
  },
  premium: {
    name: 'Premium',
    ha: 'Hasta 100 HA',
    desc: 'Tranquilidad absoluta con auditorías PAC integradas y rentabilidad al céntimo.',
    highlights: ['Auditoría PAC Automática', 'Sensores IoT del suelo', 'Soporte prioritario VIP 24/7'],
  }
};

export function FarmerDemoModal({ isOpen, onClose, tenant, primaryColor }: FarmerDemoModalProps) {
  const [activePlan, setActivePlan] = useState<'basico' | 'intermedio' | 'avanzado' | 'premium'>('intermedio');
  const [activeTab, setActiveTab] = useState<'inicio' | 'parcelas' | 'tratamientos' | 'asistente'>('inicio');
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  
  // Custom mock states for interactivity
  const [treatments, setTreatments] = useState([
    { id: 1, date: '01/06/2026', type: 'Fitosanitario', desc: 'Cobre - Parcela La Loma', status: 'Sincronizado SIEX' },
    { id: 2, date: '28/05/2026', type: 'Labor', desc: 'Desbroce hierba - Parcela El Llano', status: 'Registrado' },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ parcela: 'Parcela La Loma', producto: 'Cobre Húmedo 50%', dosis: '1.5' });
  const [isSaving, setIsSaving] = useState(false);

  // Chatbot states
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: '¡Hola! Soy tu Asistente CDC. Pregúntame cualquier duda sobre dosis legales, plagas activas en la zona o cómo rellenar el cuaderno.', timestamp: '07:22' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const coopName = tenant?.name || 'Inagro Solutions';
  const logoUrl = tenant?.logo_url;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // If user changes plan, reset sub-tab locks if activeTab is blocked
    if (activePlan === 'basico' && activeTab === 'asistente') {
      setActiveTab('inicio');
    }
  }, [activePlan]);

  if (!isOpen) return null;

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newTreatment = {
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES'),
        type: 'Fitosanitario',
        desc: `${formData.producto} - ${formData.parcela} (${formData.dosis} kg/ha)`,
        status: 'Sincronizado SIEX'
      };
      setTreatments([newTreatment, ...treatments]);
      setIsSaving(false);
      setIsAdding(false);
    }, 1200);
  };

  const presetQuestions = [
    { q: '¿Puedo aplicar cobre hoy?', a: 'Según los registros meteorológicos de la zona y tu histórico, puedes aplicar. Has consumido 1,5 kg/ha de cobre metálico este año, el máximo legal es 4 kg/ha. La dosis máxima permitida es 1,8 kg/ha. Recuerda apuntarlo al terminar.' },
    { q: '¿Hay alertas de plagas?', a: '⚠️ Alerta en tu zona: Riesgo moderado de mosca del olivo por alta humedad. Te recomiendo vigilar las parcelas del valle y aplicar trampeo preventivo o un fitosanitario autorizado en tu próximo tratamiento.' },
    { q: '¿Qué abonos puedo registrar?', a: 'Puedes registrar abonos orgánicos e inorgánicos. Si tienes el ecorrégimen de cubiertas vegetales, recuerda que no está permitido aplicar abono nitrogenado químico sobre la cubierta durante los meses de restricción.' }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { sender: 'user', text, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      // Look for preset answers or give generic one
      const found = presetQuestions.find(pq => pq.q.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(pq.q.toLowerCase()));
      const replyText = found 
        ? found.a 
        : 'Entendido. Compruebo las bases de datos oficiales del Ministerio y de tu explotación. Para el tratamiento que indicas, cumple con la dosis máxima autorizada de la sustancia activa y el plazo de seguridad es de 14 días.';
      
      const assistantMsg: Message = {
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const triggerUpgradeAlert = (featureName: string, minPlan: string) => {
    setUpgradeMessage(`El módulo "${featureName}" requiere el plan ${minPlan} o superior. ¡Prueba a cambiar el plan en el selector de la izquierda!`);
    setTimeout(() => setUpgradeMessage(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card container */}
      <div className="relative w-full max-w-5xl bg-[#050510] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col md:flex-row h-auto max-h-[92vh] z-10">
        
        {/* LEFT COLUMN: Controls and Plan overview */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-[#080818]/60 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">DEMO EN VIVO</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-black text-white leading-tight mb-2">
            Prueba el cuaderno de <br />
            <span style={{ color: primaryColor }}>{coopName}</span>
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Selecciona un plan y usa la simulación móvil de la derecha para ver cómo funciona en el tractor.
          </p>

          {/* Selector de Planes */}
          <div className="space-y-3 mb-8">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">PLAN DE EXPANSIÓN A EVALUAR</span>
            {(['basico', 'intermedio', 'avanzado', 'premium'] as const).map((planKey) => {
              const isActive = activePlan === planKey;
              const info = PLAN_INFO[planKey];
              return (
                <button
                  key={planKey}
                  onClick={() => setActivePlan(planKey)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 relative ${
                    isActive 
                      ? 'bg-white/5 border-emerald-500/50 shadow-lg' 
                      : 'border-white/5 bg-transparent hover:bg-white/[0.02] hover:border-white/10'
                  }`}
                  style={isActive ? { borderColor: `${primaryColor}60` } : {}}
                >
                  <div className="mt-1">
                    {planKey === 'premium' ? (
                      <Star size={16} className={isActive ? 'text-amber-400' : 'text-gray-500'} />
                    ) : planKey === 'avanzado' ? (
                      <Tractor size={16} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                    ) : planKey === 'intermedio' ? (
                      <ShieldCheck size={16} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
                    ) : (
                      <Leaf size={16} className={isActive ? 'text-emerald-500' : 'text-gray-500'} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{info.name}</span>
                      <span className="text-[10px] font-black text-gray-400 bg-white/5 px-2 py-0.5 rounded tracking-wide">{info.ha}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">{info.desc}</p>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Características Clave del Plan */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-auto">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-3">CONTRATANDO EL PLAN {PLAN_INFO[activePlan].name.toUpperCase()}:</span>
            <ul className="space-y-2">
              {PLAN_INFO[activePlan].highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="#planes" onClick={onClose} className="w-full">
                <button 
                  className="w-full py-3 rounded-lg font-bold text-xs text-black transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Adquirir Plan {PLAN_INFO[activePlan].name}
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile Smartphone Simulation */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex items-center justify-center bg-[#030308] relative overflow-hidden">
          {/* Dynamic upgrade message alert banner inside phone area */}
          {upgradeMessage && (
            <div className="absolute top-4 left-6 right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-400 text-xs font-bold animate-in slide-in-from-top duration-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{upgradeMessage}</span>
            </div>
          )}

          {/* Close button inside modal (desktop only) */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors hidden md:block"
          >
            <X size={24} />
          </button>

          {/* Background lights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />

          {/* Smartphone device frame wrapper */}
          <div className="w-full max-w-[340px] h-[580px] rounded-[40px] border-4 border-[#1b1b2f] bg-[#0c0c1b] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden select-none">
            {/* Status notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1b1b2f] rounded-b-2xl z-40 flex items-center justify-between px-4">
              <div className="w-2.5 h-2.5 rounded-full bg-black/60" />
              <div className="w-12 h-1 bg-black/40 rounded-full" />
            </div>

            {/* Simulated Phone Bar */}
            <div className="h-9 pt-4 px-6 flex justify-between items-center text-[10px] text-gray-500 font-bold bg-[#0c0c1b] z-30 shrink-0">
              <span>07:22</span>
              <div className="flex items-center gap-1.5">
                <span className="tracking-tighter">5G</span>
                <div className="w-5 h-2.5 rounded border border-gray-600 p-0.5 flex items-center"><div className="w-3.5 h-full bg-emerald-500 rounded-sm" /></div>
              </div>
            </div>

            {/* App Header */}
            <div className="px-4 py-3 bg-[#111126] border-b border-white/5 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt={coopName} className="h-6 max-w-[80px] object-contain" />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                    <Tractor size={12} className="text-emerald-500" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block leading-none">CD CAMPO</span>
                  <span className="text-xs font-black text-white leading-none">{coopName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10" style={{ borderColor: `${primaryColor}40`, color: primaryColor }}>
                  Plan {PLAN_INFO[activePlan].name}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400">
                  <User size={12} />
                </div>
              </div>
            </div>

            {/* App Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080815] relative z-20">
              
              {/* TAB 1: INICIO (Dashboard) */}
              {activeTab === 'inicio' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Saludo */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500">Buenos días,</h4>
                    <h3 className="text-base font-black text-white">Antonio Martínez</h3>
                  </div>

                  {/* Validador IA (Intermedio+) */}
                  {activePlan !== 'basico' ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-[10px] font-black text-emerald-500 block uppercase tracking-wider">VALIDADOR INTELIGENTE</span>
                        <p className="text-[11px] text-gray-200 mt-0.5 leading-snug">
                          Todos tus tratamientos registrados cumplen la normativa SIEX vigente. ¡Listo para exportar!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 relative group cursor-pointer" onClick={() => triggerUpgradeAlert('Validador IA', 'Intermedio')}>
                      <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-gray-500 block uppercase tracking-wider">VALIDADOR DE TRATAMIENTOS</span>
                          <span className="text-[8px] font-bold bg-amber-500/10 text-amber-500 px-1 py-0.2 rounded border border-amber-500/20 uppercase tracking-widest">PRO</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          Activa el Plan Intermedio para que validemos que tus dosis de fitosanitarios son 100% legales.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resumen Parcelas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#111126] border border-white/5">
                      <span className="text-[9px] font-bold text-gray-500 block">PARCELAS</span>
                      <span className="text-lg font-black text-white">2 Fincas</span>
                      <span className="text-[9px] text-gray-400 block mt-1">3.3 Hectáreas</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#111126] border border-white/5">
                      <span className="text-[9px] font-bold text-gray-500 block">ÚLTIMO TRATAMIENTO</span>
                      <span className="text-xs font-bold text-emerald-400 block truncate mt-1">Cobre Húmedo</span>
                      <span className="text-[9px] text-gray-500 block">Hace 3 días</span>
                    </div>
                  </div>

                  {/* Sección de Maquinaria y Operarios (Avanzado+) */}
                  {activePlan === 'avanzado' || activePlan === 'premium' ? (
                    <div className="p-3 rounded-xl bg-[#111126] border border-white/5 space-y-2">
                      <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">EQUIPOS Y RECURSOS</span>
                      <div className="flex items-center justify-between text-xs text-gray-300 py-1 border-b border-white/5">
                        <span className="flex items-center gap-1.5"><Tractor size={12} className="text-blue-400" /> Tractor John Deere</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Activo</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-300 py-1">
                        <span className="flex items-center gap-1.5"><User size={12} className="text-purple-400" /> Manolo Gómez (Operario)</span>
                        <span className="text-[10px] text-gray-400">Sin tareas</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center cursor-pointer" onClick={() => triggerUpgradeAlert('Control de Maquinaria y Operarios', 'Avanzado')}>
                      <span className="text-[10px] font-black text-gray-500 block uppercase tracking-wider">MAQUINARIA Y OPERARIOS</span>
                      <span className="text-[8px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">AVANZADO</span>
                    </div>
                  )}

                  {/* Sección de PAC y Sensores (Premium+) */}
                  {activePlan === 'premium' ? (
                    <div className="space-y-3">
                      {/* Sensores IoT */}
                      <div className="p-3 rounded-xl bg-[#111126] border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">HUMEDAD SUELO (IOT)</span>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={10} /> 32% Óptimo</span>
                        </div>
                        <div className="h-10 flex items-end gap-1 px-1">
                          {[40, 45, 38, 42, 35, 30, 32].map((val, idx) => (
                            <div key={idx} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-sm" style={{ height: `${val}%` }} />
                          ))}
                        </div>
                      </div>
                      
                      {/* Auditor PAC */}
                      <div className="p-3 rounded-xl bg-[#111126] border border-white/5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                          <Cpu size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-500 block uppercase tracking-wider">AUDITOR DE CONFORMIDAD PAC</span>
                          <p className="text-[10px] text-gray-300">Expediente 100% libre de errores para el cobro.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center cursor-pointer" onClick={() => triggerUpgradeAlert('Sensores IoT y Auditor PAC', 'Premium')}>
                      <span className="text-[10px] font-black text-gray-500 block uppercase tracking-wider">SENSORES IOT & CONTROL PAC</span>
                      <span className="text-[8px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">PREMIUM</span>
                    </div>
                  )}

                  {/* Acciones Rápidas */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-500 block uppercase tracking-wider">ACCIONES RÁPIDAS</span>
                    <button 
                      onClick={() => setActiveTab('tratamientos')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between"
                    >
                      <span>Registrar Labor o Tratamiento</span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                    {activePlan !== 'basico' ? (
                      <button 
                        onClick={() => setActiveTab('asistente')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-colors flex items-center justify-between"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span className="flex items-center gap-1.5"><Sparkles size={12} /> Preguntar al Asistente CDC</span>
                        <ChevronRight size={14} className="text-black" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => triggerUpgradeAlert('Asistente Virtual CDC', 'Intermedio')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 bg-white/[0.02] border border-white/5 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5"><Sparkles size={12} /> Asistente CDC <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded">PRO</span></span>
                        <ChevronRight size={14} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PARCELAS */}
              {activeTab === 'parcelas' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Tus Recintos SIGPAC</h3>
                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">2 Parcelas</span>
                  </div>

                  <div className="space-y-3">
                    {/* Parcela 1 */}
                    <div className="p-3 rounded-xl bg-[#111126] border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white">Parcela La Loma</h4>
                          <span className="text-[9px] text-gray-400">Olivos (Variedad Picual)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">1.20 HA</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[9px] text-gray-500">
                        <div><strong className="text-gray-300 block">Provincia:</strong> 23 (Jaén)</div>
                        <div><strong className="text-gray-300 block">Municipio:</strong> 050</div>
                        <div><strong className="text-gray-300 block">Pol/Par:</strong> 12 / 104</div>
                      </div>
                    </div>

                    {/* Parcela 2 */}
                    <div className="p-3 rounded-xl bg-[#111126] border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white">Parcela El Llano</h4>
                          <span className="text-[9px] text-gray-400">Cereales (Trigo blando)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">2.10 HA</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[9px] text-gray-500">
                        <div><strong className="text-gray-300 block">Provincia:</strong> 23 (Jaén)</div>
                        <div><strong className="text-gray-300 block">Municipio:</strong> 050</div>
                        <div><strong className="text-gray-300 block">Pol/Par:</strong> 08 / 312</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                    + Solicitar Carga Masiva SIGPAC
                  </div>
                </div>
              )}

              {/* TAB 3: TRATAMIENTOS */}
              {activeTab === 'tratamientos' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial de Labores</h3>
                    {!isAdding && (
                      <button 
                        onClick={() => setIsAdding(true)}
                        className="text-[10px] font-black text-black px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ backgroundColor: primaryColor }}
                      >
                        + Nuevo
                      </button>
                    )}
                  </div>

                  {isAdding ? (
                    <form onSubmit={handleAddTreatment} className="p-3 rounded-xl bg-[#111126] border border-white/10 space-y-3">
                      <span className="text-[10px] font-black text-gray-300 block uppercase tracking-wider">Nuevo Registro</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 block uppercase">Finca / Recinto</label>
                        <select 
                          value={formData.parcela}
                          onChange={(e) => setFormData({...formData, parcela: e.target.value})}
                          className="w-full text-xs p-2 rounded-lg bg-black border border-white/10 text-white"
                        >
                          <option>Parcela La Loma</option>
                          <option>Parcela El Llano</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 block uppercase">Producto / Labor</label>
                        <input 
                          type="text" 
                          value={formData.producto}
                          onChange={(e) => setFormData({...formData, producto: e.target.value})}
                          className="w-full text-xs p-2 rounded-lg bg-black border border-white/10 text-white focus:outline-none focus:border-emerald-500" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 block uppercase">Dosis (Kg o L / Ha)</label>
                        <input 
                          type="text" 
                          value={formData.dosis}
                          onChange={(e) => setFormData({...formData, dosis: e.target.value})}
                          className="w-full text-xs p-2 rounded-lg bg-black border border-white/10 text-white focus:outline-none focus:border-emerald-500" 
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 py-2 rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                            </>
                          ) : 'Guardar en SIEX'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      {treatments.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl bg-[#111126] border border-white/5 relative">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-gray-500">{t.date}</span>
                            <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              {t.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 leading-snug">{t.desc}</h4>
                          <span className="text-[9px] text-gray-400 mt-1 block">{t.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ASISTENTE (CDC Chatbot) */}
              {activeTab === 'asistente' && activePlan !== 'basico' && (
                <div className="flex flex-col h-full absolute inset-0 bg-[#080815] z-30 p-3 animate-in fade-in duration-200">
                  {/* Chat messages box */}
                  <div className="flex-1 overflow-y-auto space-y-2 pb-2 pr-1 pt-1">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div 
                          className={`p-2.5 rounded-2xl text-[11px] leading-snug ${
                            msg.sender === 'user' 
                              ? 'bg-emerald-500 text-black font-medium rounded-tr-sm' 
                              : 'bg-[#111126] text-white border border-white/5 rounded-tl-sm'
                          }`}
                          style={msg.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-gray-500 mt-0.5 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="mr-auto items-start max-w-[85%] flex flex-col">
                        <div className="bg-[#111126] text-gray-400 p-2.5 rounded-2xl rounded-tl-sm text-[11px] border border-white/5 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                          <span>Escribiendo respuesta...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preset Quick Questions */}
                  <div className="py-2 border-t border-white/5 space-y-1.5 shrink-0">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">PREGUNTAS SUGERIDAS:</span>
                    <div className="flex flex-wrap gap-1">
                      {presetQuestions.map((pq, idx) => (
                        <button 
                          key={idx}
                          disabled={isTyping}
                          onClick={() => handleSendMessage(pq.q)}
                          className="text-[9px] bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 px-2 py-1 rounded-lg text-left max-w-full truncate"
                        >
                          {pq.q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <div className="flex gap-1.5 pt-2 border-t border-white/5 shrink-0">
                    <input 
                      type="text" 
                      placeholder="Escribe tu duda legal o técnica..."
                      disabled={isTyping}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                      className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={isTyping}
                      className="p-2 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send size={12} className="text-black" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Phone Navigation Bar */}
            <div className="h-[52px] bg-[#0c0c1b] border-t border-white/5 flex items-center justify-around z-30 shrink-0">
              <button 
                onClick={() => setActiveTab('inicio')}
                className={`flex flex-col items-center gap-0.5 ${activeTab === 'inicio' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Tractor size={16} style={activeTab === 'inicio' ? { color: primaryColor } : {}} />
                <span className="text-[9px] font-bold">Inicio</span>
              </button>

              <button 
                onClick={() => setActiveTab('parcelas')}
                className={`flex flex-col items-center gap-0.5 ${activeTab === 'parcelas' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Map size={16} style={activeTab === 'parcelas' ? { color: primaryColor } : {}} />
                <span className="text-[9px] font-bold">Parcelas</span>
              </button>

              <button 
                onClick={() => setActiveTab('tratamientos')}
                className={`flex flex-col items-center gap-0.5 ${activeTab === 'tratamientos' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <FileSpreadsheet size={16} style={activeTab === 'tratamientos' ? { color: primaryColor } : {}} />
                <span className="text-[9px] font-bold">Registro</span>
              </button>

              <button 
                onClick={() => {
                  if (activePlan === 'basico') {
                    triggerUpgradeAlert('Asistente Virtual CDC', 'Intermedio');
                  } else {
                    setActiveTab('asistente');
                  }
                }}
                className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'asistente' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activePlan === 'basico' && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-black">
                    !
                  </div>
                )}
                <Sparkles size={16} style={activeTab === 'asistente' ? { color: primaryColor } : {}} />
                <span className="text-[9px] font-bold">Asistente</span>
              </button>
            </div>

            {/* Bottom Home Indicator */}
            <div className="h-4 bg-[#0c0c1b] flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
