'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  Users, 
  Map, 
  CheckCircle2, 
  Bug, 
  Calendar, 
  Beaker, 
  Ruler, 
  Tractor, 
  User, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  PackageOpen, 
  ThermometerSun, 
  Wind, 
  WifiOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Laptop,
  Smartphone,
  FileSpreadsheet,
  Globe,
  Droplets,
  Play
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DemoPage() {
  const [role, setRole] = useState<'technician' | 'farmer'>('technician');
  
  // Farmer view states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Vademecum Mock States
  const [vademecumResult, setVademecumResult] = useState<{
    valid: boolean;
    warnings: string[];
    errors: string[];
    loading: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    parcela_id: 'p1',
    fecha: new Date().toISOString().split('T')[0],
    inventario_id: 'inv1',
    nombre_producto: 'Oxicloruro de Cobre 50%',
    producto_mapa_id: '18492',
    dosis: '2.5',
    unidad_dosis: 'kg/ha',
    superficie_tratada: '',
    maquinaria_usada: 'Atomizador Hardi 1200L',
    operario: 'Juan Pérez Roldán',
    temperatura: '22',
    velocidad_viento: '8',
  });

  const parcelas = [
    { id: 'p1', nombre: 'Olivos Centenarios - El Alamillo', hectareas: '4.5' },
    { id: 'p2', nombre: 'Campiña Alta - Las Lomas', hectareas: '2.8' },
    { id: 'p3', nombre: 'Pago de Enmedio', hectareas: '1.2' },
  ];

  const inventory = [
    { id: 'inv1', nombre_producto: 'Oxicloruro de Cobre 50%', numero_registro: '18492', cantidad_actual: 45, unidad: 'kg' },
    { id: 'inv2', nombre_producto: 'Glifosato Premium', numero_registro: '24958', cantidad_actual: 12, unidad: 'L' },
    { id: 'inv3', nombre_producto: 'Deltametrina 2.5% EC', numero_registro: '19875', cantidad_actual: 3, unidad: 'L' },
  ];

  // Real-time vademecum simulation based on state
  useEffect(() => {
    if (!form.dosis || isNaN(Number(form.dosis))) {
      setVademecumResult(null);
      return;
    }

    const dosisVal = Number(form.dosis);
    setVademecumResult({ valid: true, warnings: [], errors: [], loading: true });

    const timer = setTimeout(() => {
      if (dosisVal > 5) {
        setVademecumResult({
          valid: false,
          errors: ['La dosis excede el límite máximo del vademécum para olivar (Máx. 5.0 kg/ha). Reduzca la dosis para cumplir con el registro oficial.'],
          warnings: [],
          loading: false
        });
      } else if (dosisVal > 3.5) {
        setVademecumResult({
          valid: true,
          errors: [],
          warnings: ['⚠️ Alerta ambiental: Dosis elevada. Se recomienda aplicar medidas de mitigación contra la deriva de viento.'],
          loading: false
        });
      } else {
        setVademecumResult({
          valid: true,
          errors: [],
          warnings: [],
          loading: false
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.dosis, form.nombre_producto]);

  const handleInventoryChange = (invId: string) => {
    if (!invId) {
      setForm(prev => ({ ...prev, inventario_id: '', nombre_producto: '', producto_mapa_id: '' }));
      return;
    }
    const item = inventory.find(i => i.id === invId);
    if (item) {
      setForm(prev => ({
        ...prev,
        inventario_id: invId,
        nombre_producto: item.nombre_producto,
        producto_mapa_id: item.numero_registro
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!form.parcela_id) errors.push('Seleccione una parcela');
    if (!form.nombre_producto) errors.push('Seleccione un producto comercial');
    if (!form.dosis || Number(form.dosis) <= 0) errors.push('La dosis debe ser superior a 0');
    if (vademecumResult && !vademecumResult.valid) {
      errors.push(`Bloqueado por Vademécum del MAPA: ${vademecumResult.errors[0]}`);
    }

    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    }, 1200);
  };

  // Real Excel generator using xlsx
  const handleExportSIEX = () => {
    const data = [
      { 
        "Parcela SIGPAC": 'Olivos Centenarios (Finca El Alamillo)', 
        "Hectáreas": 4.5, 
        "Fecha de Aplicación": form.fecha, 
        "Producto Comercial": form.nombre_producto, 
        "Nº Registro MAPA": form.producto_mapa_id, 
        "Dosis Aplicada": `${form.dosis} ${form.unidad_dosis}`, 
        "Maquinaria Utilizada": form.maquinaria_usada, 
        "Operario Aplicador": form.operario,
        "Temperatura (°C)": `${form.temperatura} °C`,
        "Viento (km/h)": `${form.velocidad_viento} km/h`,
        "Estado SIEX": "Conforme - Encolado para envío"
      },
      { 
        "Parcela SIGPAC": 'Campiña Alta (Polígono 4, Parcela 12)', 
        "Hectáreas": 2.8, 
        "Fecha de Aplicación": '2026-05-18', 
        "Producto Comercial": 'Glifosato Premium', 
        "Nº Registro MAPA": '24958', 
        "Dosis Aplicada": '1.5 L/ha', 
        "Maquinaria Utilizada": 'Barra interlíneas tractor', 
        "Operario Aplicador": form.operario,
        "Temperatura (°C)": '20.5 °C',
        "Viento (km/h)": '5.0 km/h',
        "Estado SIEX": "Validado - Enviado con éxito"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SIEX Registro Oficial");
    
    // Style column widths for clean look
    const max_widths = [
      { wch: 38 }, { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 18 },
      { wch: 15 }, { wch: 28 }, { wch: 24 }, { wch: 16 }, { wch: 15 }, { wch: 26 }
    ];
    worksheet['!cols'] = max_widths;

    XLSX.writeFile(workbook, "Cuaderno_Digital_InagroSolutions_Demo.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-emerald-500/20 scroll-smooth">
      {/* 1. TOP BAR INTERACTIVA */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07071c]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-all">
                <TrendingUp className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Inagro<span className="text-emerald-400">Solutions</span></span>
            </Link>
            <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              Modo Demo Activo
            </div>
          </div>

          {/* DUAL SELECTOR COMPONENT */}
          <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setRole('technician')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                role === 'technician' 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Laptop size={14} />
              🏢 Vista Cooperativa
            </button>
            <button
              onClick={() => setRole('farmer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                role === 'farmer' 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              🚜 Vista Agricultor (PWA)
            </button>
          </div>

          <div>
            <Link href="/partner/signup">
              <GlowButton variant="primary" className="text-xs px-5 py-2.5 h-auto font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Lanzar mi marca blanca gratis
              </GlowButton>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DEMO CONTENT CONTAINER */}
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PRESENTATION SUB-HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Entorno Autoguiado</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Prueba cómo verían la plataforma <span className="glow-text text-emerald-400">tus clientes</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            Cambia entre las dos interfaces en la cabecera para ver el panel de control del gestor técnico en la cooperativa y el funcionamiento móvil offline del agricultor.
          </p>
        </div>

        {/* VIEW A: TECHNICIAN INTERACTION */}
        {role === 'technician' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* INFORMATIVE CARD */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-white text-lg">Estás en: El Panel de la Cooperativa / Asesor Técnico</h4>
                <p className="text-xs text-white/50 leading-relaxed mt-1">
                  Desde aquí supervisas a todos tus asociados agrícolas, emites prescripciones oficiales del MAPA y firmas lotes para el SIEX en automático.
                </p>
              </div>
            </div>

            {/* MOCK KPIS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Agricultores Asignados', value: '3 agricultores', icon: Users, color: 'text-indigo-400', desc: 'Socio Cooperador' },
                { label: 'Explotaciones Supervisadas', value: '8 explotaciones', icon: Map, color: 'text-emerald-400', desc: '142 Hectáreas SIGPAC' },
                { label: 'Cuadernos Pendientes de Firma', value: '1 cuaderno', icon: CheckCircle2, color: 'text-amber-400', desc: 'Fecha límite: 30 de Mayo' },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <GlassCard key={i} className="p-6 border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">{kpi.label}</h3>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{kpi.value}</p>
                      <p className="text-[10px] text-white/30 font-semibold uppercase mt-1 tracking-wider">{kpi.desc}</p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* MAIN INTERFACE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* AGRICULTORES ASIGNADOS */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6 border-white/5 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-white tracking-tight">Tus Agricultores Registrados</h3>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">B2B Base</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                          <th className="pb-3">Nombre</th>
                          <th className="pb-3">Explotación Principal</th>
                          <th className="pb-3">Superficie</th>
                          <th className="pb-3">Cumplimiento SIEX</th>
                          <th className="pb-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {[
                          { name: 'Juan Pérez Roldán', farm: 'El Alamillo (Córdoba)', size: '4.5 ha', status: 'Listo para firmar', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                          { name: 'María Delgado Ruiz', farm: 'La Loma (Jaén)', size: '2.8 ha', status: 'Conforme y enviado', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                          { name: 'Cooperativa Agraria Piloto', farm: 'Pago de Enmedio (Sevilla)', size: '1.2 ha', status: 'Conforme y enviado', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                        ].map((item, index) => (
                          <tr key={index} className="group hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 font-bold text-white group-hover:text-emerald-400 transition-colors">{item.name}</td>
                            <td className="py-4 text-white/60">{item.farm}</td>
                            <td className="py-4 font-semibold">{item.size}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${item.badge}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => setRole('farmer')}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-emerald-500 hover:text-black transition-colors"
                              >
                                Ver Cuaderno
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>

              {/* RECENT ACTIVITY & TELEMETRY */}
              <div>
                <GlassCard className="p-6 border-white/5 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white mb-6">Actividad y Telemetría</h3>
                    <div className="space-y-4">
                      {[
                        { type: 'Tratamiento', item: 'Oxicloruro de Cobre', grower: 'Juan Pérez', time: 'Hace 4 min', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                        { type: 'Abonado', item: 'Complejo NPK', grower: 'María Delgado', time: 'Hace 1 hora', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                        { type: 'Cosecha', item: 'Olivas Picual (8.5tn)', grower: 'Juan Pérez', time: 'Hace 1 día', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                      ].map((act, i) => (
                        <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${act.bg}`}>
                                {act.type}
                              </span>
                              <span className="font-bold text-white">{act.item}</span>
                            </div>
                            <p className="text-[10px] text-white/40">Agricultor: <span className="font-bold text-white/60">{act.grower}</span></p>
                          </div>
                          <span className="text-[9px] font-semibold text-white/30 shrink-0">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-6">
                    <p className="text-xs text-white/40 leading-relaxed font-semibold italic text-center">
                      * El técnico puede recibir alertas automáticas cuando un agricultor cometa una infracción reglamentaria.
                    </p>
                  </div>
                </GlassCard>
              </div>

            </div>

            {/* CALL TO ACTION ACCESIBLE */}
            <div className="p-8 bg-gradient-to-br from-indigo-900/30 to-emerald-950/20 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black text-white">¿Te gusta cómo gestiona el técnico su cooperativa?</h3>
                <p className="text-sm text-white/60">Lanza hoy mismo la plataforma de tu cooperativa con tu propio logo y empieza a facturar el 50% recurrente.</p>
              </div>
              <Link href="/partner/signup" className="shrink-0 w-full md:w-auto">
                <GlowButton variant="primary" className="w-full md:w-auto font-black shadow-lg py-5 px-8">
                  Comenzar ahora (100% Gratis)
                  <ArrowRight className="ml-2 w-4 h-4" />
                </GlowButton>
              </Link>
            </div>
          </div>
        )}

        {/* VIEW B: FARMER INTERACTION */}
        {role === 'farmer' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* INFORMATIVE CARD */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Smartphone className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-white text-lg">Estás en: El Cuaderno del Agricultor (Vista Móvil PWA)</h4>
                <p className="text-xs text-white/50 leading-relaxed mt-1">
                  Aquí simulas la experiencia del agricultor registrando labores sobre el tractor. Prueba a cambiar las dosis en el formulario móvil para ver cómo funciona el validador en tiempo real y descarga el Excel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* SMARTPHONE FRAME WORKSPACE */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[375px] h-[780px] bg-black rounded-[48px] p-3 shadow-[0_0_60px_rgba(16,185,129,0.15)] border-4 border-white/10 flex flex-col overflow-hidden">
                  
                  {/* IPHONE CAMERA NOTCH */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/5 ml-auto mr-4"></div>
                  </div>
                  
                  {/* APP CONTAINER */}
                  <div className="flex-1 bg-[#06060c] rounded-[36px] overflow-y-auto p-4 pt-8 text-left space-y-5 scrollbar-none relative">
                    
                    {/* APP HEADER */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="text-emerald-400 w-4 h-4" />
                        <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">San Isidro PWA</span>
                      </div>
                      <button 
                        onClick={() => setIsOffline(!isOffline)}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                          isOffline 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/20 animate-pulse' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isOffline ? '📴 Offline' : '📶 Online'}
                      </button>
                    </div>

                    {/* SUCCESS PANEL */}
                    {success ? (
                      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col items-center gap-4 text-center my-12 animate-in zoom-in-95 duration-500">
                        {isOffline ? (
                          <>
                            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                              <WifiOff className="w-7 h-7 text-amber-400 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-white mb-1">Guardado Local</h4>
                              <p className="text-[9px] text-amber-300 font-bold uppercase tracking-widest leading-relaxed">
                                Registrado sin internet. Se subirá automáticamente al recuperar cobertura.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                              <Check className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-white mb-1">Tratamiento Registrado</h4>
                              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                                Validado con éxito en el MAPA y descontado del stock.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                          <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/10">
                            <Bug className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">Nuevo Tratamiento</h4>
                            <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Fitosanitario • Almacén</p>
                          </div>
                        </div>

                        {validationErrors.length > 0 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                            {validationErrors.map((err, i) => (
                              <p key={i} className="text-[9px] text-red-400 font-bold flex items-center gap-1.5 leading-tight">
                                <AlertTriangle size={10} className="shrink-0" /> {err}
                              </p>
                            ))}
                          </div>
                        )}

                        <div>
                          <label className="text-[9px] font-bold text-white/60 block mb-1">Parcela SIGPAC</label>
                          <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                            value={form.parcela_id}
                            onChange={e => setForm({...form, parcela_id: e.target.value})}
                          >
                            {parcelas.map(p => (
                              <option key={p.id} value={p.id} className="bg-[#050510]">{p.nombre} ({p.hectareas} ha)</option>
                            ))}
                          </select>
                        </div>

                        {/* PRODUCTO DEL ALMACÉN */}
                        <div className="p-3 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl space-y-2">
                          <label className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                            <PackageOpen size={10} /> Producto del Almacén
                          </label>
                          <select
                            className="w-full bg-[#050510] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                            value={form.inventario_id}
                            onChange={e => handleInventoryChange(e.target.value)}
                          >
                            {inventory.map(item => (
                              <option key={item.id} value={item.id} className="bg-[#050510]">
                                {item.nombre_producto} (Stock: {item.cantidad_actual} {item.unidad})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DOSIS */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-white/60 block mb-1">Dosis</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                              value={form.dosis}
                              onChange={e => setForm({...form, dosis: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-white/60 block mb-1">Unidad</label>
                            <select
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                              value={form.unidad_dosis}
                              onChange={e => setForm({...form, unidad_dosis: e.target.value})}
                            >
                              <option value="kg/ha">kg/ha</option>
                              <option value="L/ha">L/ha</option>
                              <option value="cc/100L">cc/100L</option>
                            </select>
                          </div>
                        </div>

                        {/* VADEMECUM ALERT */}
                        {vademecumResult && (
                          <div className={`p-3 rounded-xl border text-[9px] leading-relaxed transition-all ${
                            vademecumResult.loading
                              ? 'bg-white/5 border-white/10 text-white/60 animate-pulse'
                              : !vademecumResult.valid
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : vademecumResult.warnings.length > 0
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {vademecumResult.loading ? (
                              <p className="flex items-center gap-1.5 font-bold"><Sparkles size={10} className="animate-spin" /> Verificando con Vademécum del MAPA...</p>
                            ) : !vademecumResult.valid ? (
                              <p className="flex items-start gap-1.5 font-bold"><AlertTriangle size={12} className="shrink-0" /> {vademecumResult.errors[0]}</p>
                            ) : vademecumResult.warnings.length > 0 ? (
                              <p className="flex items-start gap-1.5 font-bold"><AlertTriangle size={12} className="shrink-0" /> {vademecumResult.warnings[0]}</p>
                            ) : (
                              <p className="flex items-center gap-1.5 font-bold"><CheckCircle2 size={12} className="shrink-0" /> Producto y dosis recomendadas correctas y autorizadas para olivar.</p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-white/60">
                          <div>
                            <label className="text-[9px] font-bold block mb-1">Maquinaria</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white"
                              value={form.maquinaria_usada}
                              onChange={e => setForm({...form, maquinaria_usada: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold block mb-1">Operario</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white"
                              value={form.operario}
                              onChange={e => setForm({...form, operario: e.target.value})}
                            />
                          </div>
                        </div>

                        {/* METEO INFO */}
                        <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                          <p className="text-[8px] text-sky-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Wind size={10} /> Sensor Metereológico (SIEX)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg text-[9px] font-bold text-white/70">
                              <span>Temp:</span>
                              <span className="text-white font-extrabold">{form.temperatura} °C</span>
                            </div>
                            <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg text-[9px] font-bold text-white/70">
                              <span>Viento:</span>
                              <span className="text-white font-extrabold">{form.velocidad_viento} km/h</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full py-3 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          {saving ? 'Registrando...' : 'Registrar Tratamiento'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* AUTOMATION DETAILS & EXPORTS */}
              <div className="lg:col-span-7 space-y-8 text-left">
                <GlassCard className="p-8 border-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight">IA Vademécum & PWA Activo</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Lógica de Pruebas</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-white/60">
                    <p>
                      El simulador del teléfono móvil de la izquierda tiene activadas las dos joyas de la corona de la tecnología de InagroSolutions:
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Validación con el Vademécum Oficial:</strong>
                          <p className="text-xs text-white/50 mt-0.5">Si reduces la dosis por debajo de 3.5, verás que el semáforo se pone en verde. Si la subes por encima de 5, la IA te bloqueará de forma automática impidiendo que registres una labor ilegal en el SIEX.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Simulador de Cobertura (Offline):</strong>
                          <p className="text-xs text-white/50 mt-0.5">Prueba a pulsar en el botón de "📶 Online" en el móvil para cambiar al modo "📴 Offline" (Simulando estar en un barranco sin señal móvil). Al guardar el formulario, la PWA lo encolará en su base de datos local de forma inmediata.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* REAL EXPORT ACTION CONTAINER */}
                <GlassCard className="p-8 border-emerald-500/20 bg-emerald-950/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                      <FileSpreadsheet size={12} /> Generador SIEX Real
                    </span>
                    <h3 className="text-xl font-black text-white">Descarga el Cuaderno en Vivo</h3>
                    <p className="text-xs text-white/50">Genera y descarga un Excel oficial real estructurado con los tratamientos fitosanitarios de prueba.</p>
                  </div>
                  <button 
                    onClick={handleExportSIEX}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FileSpreadsheet size={16} />
                    Exportar Excel de Prueba
                  </button>
                </GlassCard>
              </div>

            </div>

            {/* CALL TO ACTION ACCESIBLE */}
            <div className="p-8 bg-gradient-to-br from-indigo-900/30 to-emerald-950/20 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black text-white">¿Te gusta la sencillez de cara al Agricultor?</h3>
                <p className="text-sm text-white/60">Tú pones la marca blanca y nosotros ponemos toda esta tecnología premium. Gana el 50% de comisiones recurrentes.</p>
              </div>
              <Link href="/partner/signup" className="shrink-0 w-full md:w-auto">
                <GlowButton variant="primary" className="w-full md:w-auto font-black shadow-lg py-5 px-8">
                  Crear mi plataforma gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </GlowButton>
              </Link>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-black/60 text-center relative z-20">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} InagroSolutions. Demostración técnica interactiva autorizada. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
