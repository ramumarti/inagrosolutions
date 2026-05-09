"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, Leaf, Smartphone, Headset, ShieldCheck, Star, HeartHandshake, Map, Tractor, FileSpreadsheet, Check, X } from 'lucide-react';
import Link from 'next/link';
import { TIER_CONFIG } from '@/lib/modules';

const PlanFeatures = ({ costes, cosechas, traz, dash, iot, alertas }: { costes: boolean, cosechas: boolean, traz: boolean, dash: boolean, iot: boolean, alertas: boolean }) => {
  const Feature = ({ name, active, isLegal }: { name: string, active: boolean, isLegal?: boolean }) => (
    <li className="flex items-center gap-3 py-1">
      {active ? <Check className="w-4 h-4 text-emerald-500 font-bold shrink-0" strokeWidth={3} /> : <X className="w-4 h-4 text-white/20 font-bold shrink-0" strokeWidth={3} />}
      <span className={`text-sm flex items-center gap-2 ${active ? 'text-white' : 'text-white/30'} font-medium`}>
        {name}
      </span>
      {isLegal && (
        <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest">LEGAL</span>
      )}
    </li>
  );

  return (
    <ul className="space-y-3 mb-auto">
      <Feature name="Registro SIEX" active={true} isLegal={true} />
      <Feature name="Fitosanitarios" active={true} isLegal={true} />
      <Feature name="Almacén de Insumos" active={true} isLegal={true} />
      <Feature name="Fertilización" active={true} isLegal={true} />
      <Feature name="Labores Agrícolas" active={true} isLegal={true} />
      <Feature name="Gestión de Parcelas" active={true} isLegal={true} />
      <Feature name="Control de Costes" active={costes} />
      <Feature name="Gestión de Cosechas" active={cosechas} />
      <Feature name="Trazabilidad" active={traz} />
      <Feature name="Dashboards Pro" active={dash} />
      <Feature name="Sensores IoT" active={iot} />
      <Feature name="Alertas Inteligentes" active={alertas} />
      <Feature name="Exportación PAC" active={true} isLegal={true} />
    </ul>
  );
};

export function PricingClient({ tenant, tenantSlug }: { tenant: any, tenantSlug?: string }) {
  const [annualBilling, setAnnualBilling] = useState(false);

  const primaryColor = tenant?.primary_color || '#10B981';
  const partnerName = tenant?.name || "InagroSolutions";
  const logoUrl = tenant?.logo_url;
  const partnerDesc = tenant?.public_description || "\"Contamos con Partners en toda España que conocen el campo en primera persona. Ellos pueden brindarte este sistema bajo su propia marca, con la garantía y cercanía que tú te mereces.\"";

  const getSignupUrl = (plan: string) => `/signup?plan=${plan}${tenantSlug ? `&tenant=${tenantSlug}` : ''}`;

  return (
    <div className="py-20 bg-black text-white selection:bg-white/20 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-10" style={{ backgroundColor: primaryColor }} />

      {/* 1. HERO SECTION */}
      <section className="relative pb-20 px-6 max-w-7xl mx-auto text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-8"
          style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, color: primaryColor }}
        >
          <Leaf className="w-4 h-4" />
          <span>El Cuaderno Digital más fácil del campo</span>
        </div>
        
        {logoUrl && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
              <img src={logoUrl} alt={partnerName} className="h-16 object-contain" />
            </div>
          </div>
        )}
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Lleva tu explotación al día, <br className="hidden md:block" />
          <span style={{ color: primaryColor, textShadow: `0 0 15px ${primaryColor}80` }}>sin tocar un solo papel.</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          El Cuaderno Digital Agrícola tan fácil de usar que lo llevarás desde el tractor. 
          Ahorra horas de oficina y cumple la ley <strong className="text-white">sin dolores de cabeza.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm md:text-base text-gray-300 font-medium mb-12">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Sin complicaciones informáticas</div>
          <div className="hidden sm:block" style={{ color: primaryColor }}>•</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Adaptado a la normativa SIEX</div>
          <div className="hidden sm:block" style={{ color: primaryColor }}>•</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Soporte humano real</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="#planes" className="w-full sm:w-auto">
            <button 
              className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105"
              style={{ backgroundColor: primaryColor, color: '#000' }}
            >
              Ver Planes de Precios
            </button>
          </a>
          <button className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
            <Headset className="w-5 h-5" />
            Hablar con un Asesor
          </button>
        </div>
      </section>

      {/* 2. TARGET AUDIENCE */}
      <section className="py-20 relative border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿A quién ayudamos a dormir más tranquilo?</h2>
            <p className="text-gray-400">Diseñado para facilitarle la vida a todos los actores del campo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6 border-white/5 hover:border-emerald-500/30 transition-colors text-center group">
              <Tractor className="w-10 h-10 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Agricultores</h3>
              <p className="text-sm text-gray-400">Que prefieren estar en la tierra antes que frente a una pantalla de ordenador.</p>
            </GlassCard>
            <GlassCard className="p-6 border-white/5 hover:border-emerald-500/30 transition-colors text-center group">
              <Map className="w-10 h-10 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Pequeñas Fincas</h3>
              <p className="text-sm text-gray-400">Que necesitan automatizar su gestión pacíficamente y sin gastar una fortuna.</p>
            </GlassCard>
            <GlassCard className="p-6 border-white/5 hover:border-emerald-500/30 transition-colors text-center group">
              <HeartHandshake className="w-10 h-10 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Cooperativas</h3>
              <p className="text-sm text-gray-400">Que buscan digitalizar a sus socios de manera uniforme con su propia marca.</p>
            </GlassCard>
            <GlassCard className="p-6 border-white/5 hover:border-emerald-500/30 transition-colors text-center group">
              <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Técnicos</h3>
              <p className="text-sm text-gray-400">Que necesitan acceder rápidamente a los tratamientos de sus clientes.</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. BENEFITS */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16">Tu día a día en el campo, <br className="hidden sm:block" /><span style={{ color: primaryColor }}>mucho más sencillo.</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: FileSpreadsheet, title: "Menos papeleo", desc: "Adiós a perder albaranes y facturas. Pasa a digital y guárdalo todo al instante." },
            { icon: ShieldCheck, title: "Cumple las normativas", desc: "Evita multas. Tu cuaderno siempre adaptado a la legislación (SIEX/REGEPA)." },
            { icon: Smartphone, title: "Desde el propio campo", desc: "Registra los tratamientos o las labores desde el móvil, en el mismo instante." },
            { icon: Map, title: "Todo en un solo lugar", desc: "Parcelas, riegos, maquinaria y abonos, centralizados de un vistazo rápido." },
            { icon: Headset, title: "No estás solo", desc: "Soporte humano. Si te surge cualquier duda o te atascas, estamos al otro lado." },
            { icon: Leaf, title: "Calculadora de Dosis", desc: "Control automático de volúmenes de caldo y compatibilidades en cada parcela." }
          ].map((benefit, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <benefit.icon className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-white">{benefit.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRICING PLANS */}
      <section id="planes" className="py-24 relative bg-[#0B0F15]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="mb-16">
            <h4 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500" /> PLANES DEL CUADERNO DIGITAL
            </h4>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">TU PLAN DE EXPLOTACIÓN</h2>
                <p className="text-gray-400 text-lg">Todos los módulos obligatorios incluidos. Ahorra 2 meses con el pago anual.</p>
              </div>
              
              {/* Toggle Billing */}
              <div className="inline-flex items-center p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
                <button 
                  onClick={() => setAnnualBilling(false)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${!annualBilling ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white'}`}
                  style={!annualBilling ? { backgroundColor: primaryColor } : {}}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setAnnualBilling(true)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annualBilling ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-gray-400 hover:text-white'}`}
                  style={annualBilling ? { backgroundColor: primaryColor } : {}}
                >
                  Anual <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20">-2 MESES</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* PLAN BÁSICO */}
            <div className="bg-[#121820] border border-white/5 rounded-3xl p-8 flex flex-col relative transition-all hover:border-emerald-500/30">
              <div className="absolute top-6 right-6 bg-emerald-900/40 text-emerald-400 text-xs font-black uppercase px-3 py-1 rounded-md border border-emerald-500/20">
                ACTUAL
              </div>
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-1">Básico</h3>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">HASTA 5 HA</p>
              
              <div className="mb-10">
                <span className="text-5xl font-black">
                  {annualBilling
                    ? TIER_CONFIG.basico.price_annual.toFixed(2).replace('.', ',')
                    : TIER_CONFIG.basico.price_monthly.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-gray-500 font-medium ml-1">/{annualBilling ? 'año' : 'mes'}</span>
                <p className="text-xs text-white/40 mt-1 text-center">+ IVA</p>
              </div>
              
              <PlanFeatures costes={false} cosechas={false} traz={false} dash={false} iot={false} alertas={false} />
              
              <div className="mt-8 pt-8 border-t border-white/5 mt-auto">
                <button className="w-full py-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-300">
                  Plan Actual
                </button>
              </div>
            </div>

            {/* PLAN INTERMEDIO */}
            <div className="bg-[#121820] border border-white/5 rounded-3xl p-8 flex flex-col transition-all hover:border-emerald-500/30">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-1">Intermedio</h3>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">HASTA 20 HA</p>
              
              <div className="mb-10">
                <span className="text-5xl font-black">
                  {annualBilling
                    ? TIER_CONFIG.intermedio.price_annual.toFixed(2).replace('.', ',')
                    : TIER_CONFIG.intermedio.price_monthly.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-gray-500 font-medium ml-1">/{annualBilling ? 'año' : 'mes'}</span>
                <p className="text-xs text-white/40 mt-1 text-center">+ IVA</p>
              </div>
              
              <PlanFeatures costes={true} cosechas={true} traz={false} dash={false} iot={false} alertas={true} />
              
              <div className="mt-8 pt-8 border-t border-white/5 mt-auto">
                <Link href={getSignupUrl('intermedio')}>
                  <button 
                    className="w-full py-4 rounded-xl font-bold text-black transition-colors shadow-lg hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Seleccionar Intermedio
                  </button>
                </Link>
              </div>
            </div>

            {/* PLAN AVANZADO */}
            <div className="bg-[#121820] border border-white/5 rounded-3xl p-8 flex flex-col transition-all hover:border-emerald-500/30">
               <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-1">Avanzado</h3>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">HASTA 50 HA</p>
              
              <div className="mb-10">
                <span className="text-5xl font-black">
                  {annualBilling
                    ? TIER_CONFIG.avanzado.price_annual.toFixed(2).replace('.', ',')
                    : TIER_CONFIG.avanzado.price_monthly.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-gray-500 font-medium ml-1">/{annualBilling ? 'año' : 'mes'}</span>
                <p className="text-xs text-white/40 mt-1 text-center">+ IVA</p>
              </div>
              
              <PlanFeatures costes={true} cosechas={true} traz={true} dash={true} iot={false} alertas={true} />
              
              <div className="mt-8 pt-8 border-t border-white/5 mt-auto">
                <Link href={getSignupUrl('avanzado')}>
                  <button 
                    className="w-full py-4 rounded-xl font-bold text-black transition-colors shadow-lg hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Seleccionar Avanzado
                  </button>
                </Link>
              </div>
            </div>

            {/* PLAN PREMIUM */}
            <div className="bg-[#121820] border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-amber-300" />
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-1 text-white">Premium</h3>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">HASTA 100 HA</p>
              
              <div className="mb-10">
                <span className="text-5xl font-black text-white">
                  {annualBilling
                    ? TIER_CONFIG.premium.price_annual.toFixed(2).replace('.', ',')
                    : TIER_CONFIG.premium.price_monthly.toFixed(2).replace('.', ',')} €
                </span>
                <span className="text-gray-500 font-medium ml-1">/{annualBilling ? 'año' : 'mes'}</span>
                <p className="text-xs text-white/40 mt-1 text-center">+ IVA</p>
              </div>
              
              <PlanFeatures costes={true} cosechas={true} traz={true} dash={true} iot={true} alertas={true} />
              
              <div className="mt-8 pt-8 border-t border-white/5 mt-auto">
                <Link href={getSignupUrl('premium')}>
                  <button 
                    className="w-full py-4 rounded-xl font-bold text-black transition-colors shadow-lg hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Seleccionar Premium
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ADDITIONAL SERVICES */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4 text-center">¿Prefieres no tocar el ordenador?</h2>
          <p className="text-gray-400 text-center mb-12">Nuestros técnicos realizan todos estos servicios extra para que no pierdas tu tiempo.</p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-black/40 border border-white/10 rounded-2xl gap-4 hover:border-emerald-500/50 transition-colors">
              <div>
                <h4 className="font-bold text-lg text-white">Alta y configuración inicial de parcelas</h4>
                <p className="text-sm text-gray-400">Pásanos tus documentos del SIGPAC y te creamos todas las fincas en el sistema.</p>
              </div>
              <div className="text-emerald-400 font-bold whitespace-nowrap bg-emerald-500/10 px-4 py-2 rounded-lg text-sm sm:text-base">Desde 50€</div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-black/40 border border-white/10 rounded-2xl gap-4 hover:border-emerald-500/50 transition-colors">
              <div>
                <h4 className="font-bold text-lg text-white">Soporte y consultas para inspecciones</h4>
                <p className="text-sm text-gray-400">Asistencia prioritaria, por si recibes un requerimiento de tu comunidad autónoma.</p>
              </div>
              <div className="text-emerald-400 font-bold whitespace-nowrap bg-emerald-500/10 px-4 py-2 rounded-lg text-sm sm:text-base">Consultar</div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-black/40 border border-white/10 rounded-2xl gap-4 hover:border-emerald-500/50 transition-colors">
              <div>
                <h4 className="font-bold text-lg text-white">Asesoramiento Agronómico</h4>
                <p className="text-sm text-gray-400">Nos acercamos a la finca, visamos los tratamientos y optimizamos tus terrenos.</p>
              </div>
              <div className="text-emerald-400 font-bold whitespace-nowrap bg-emerald-500/10 px-4 py-2 rounded-lg text-sm sm:text-base">Desde 90€/visita</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTNER BLOCK (WHITE LABEL) */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <GlassCard className="p-8 md:p-12 border-white/10 relative overflow-hidden bg-white/5" style={{ borderColor: `${primaryColor}40` }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `linear-gradient(to right, ${primaryColor}, transparent)` }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="flex-1 space-y-6 text-center md:text-left">
                {tenantSlug ? (
                  <h3 className="text-2xl font-bold">Portal oficial de <span style={{ color: primaryColor }}>{partnerName}</span></h3>
                ) : (
                  <h3 className="text-2xl font-bold">Ofrecido por tu entidad asesora de confianza <span style={{ color: primaryColor }}>{partnerName}</span></h3>
                )}
                <p className="text-gray-300 text-sm leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-2">
                  {partnerDesc}
                </p>
                <div className="flex flex-col gap-2 text-sm text-gray-400">
                  {tenant?.address ? <span>📍 {tenant.address}</span> : <span>📍 Más de 50 Cooperativas asociadas.</span>}
                  {tenant?.contact_email && <span>✉️ {tenant.contact_email}</span>}
                  {tenant?.contact_phone && <span>📞 {tenant.contact_phone}</span>}
                  <span>🚀 Tu Cuaderno SIEX hoy más fácil que nunca.</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                {tenant?.contact_phone ? (
                  <a href={`https://wa.me/${tenant.contact_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                    <button className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                      <Smartphone className="w-5 h-5" />
                      Contactar con mi Entidad Asesora
                    </button>
                  </a>
                ) : (
                  <button className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                    <HeartHandshake className="w-5 h-5" />
                    Localizar un Partner
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Lo que dicen quienes ya lo usan en el campo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GlassCard className="p-8 text-left relative overflow-hidden">
              <div className="text-8xl absolute -top-4 right-2 font-serif opacity-10" style={{ color: primaryColor }}>"</div>
              <p className="text-gray-300 italic mb-6 relative z-10 text-sm md:text-base leading-relaxed">
                Antes me pasaba el domingo por la tarde recopilando facturas. Ahora apunto el tratamiento con el móvil según me bajo del tractor y el fin de semana descanso.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black border flex items-center justify-center font-bold" style={{ borderColor: `${primaryColor}80`, color: primaryColor }}>AM</div>
                <div>
                  <h4 className="font-bold text-white">Antonio Martínez</h4>
                  <p className="text-xs text-gray-400">Agricultor (Cereales)</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-8 text-left relative overflow-hidden">
              <div className="text-8xl absolute -top-4 right-2 font-serif opacity-10" style={{ color: primaryColor }}>"</div>
              <p className="text-gray-300 italic mb-6 relative z-10 text-sm md:text-base leading-relaxed">
                Le tenía terror a las multas de medio ambiente. Desde que todo está en la app, descargo el archivo Excel oficial con un botón y el informe pericial 100% legal.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black border flex items-center justify-center font-bold" style={{ borderColor: `${primaryColor}80`, color: primaryColor }}>PG</div>
                <div>
                  <h4 className="font-bold text-white">Pilar G.</h4>
                  <p className="text-xs text-gray-400">Propiedad de Olivar tradicional</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none opacity-10" style={{ backgroundColor: primaryColor }} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">No te la juegues con la próxima PAC.</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Evita sanciones por mala documentación. Empieza a proteger tu explotación ahora mismo y gestiona todo de la forma más fácil del mundo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#planes" className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                Comenzar Hoy Mismo
              </button>
            </a>
            <button className="w-full sm:w-auto h-16 px-10 rounded-xl font-bold text-white bg-white/5 border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <Headset className="w-6 h-6" />
              Hablar con un Agente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
