"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  BookOpen, 
  FileCheck2, 
  LifeBuoy, 
  Video, 
  Smartphone,
  ExternalLink,
  Phone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function HelpPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const faqs = [
    { q: "¿Cómo registro mi cosecha?", icon: <FileCheck2 className="text-emerald-400" /> },
    { q: "¿Es obligatorio el SIEX?", icon: <BookOpen className="text-amber-400" /> },
    { q: "Sincronización offline", icon: <Smartphone className="text-blue-400" /> },
    { q: "Videotutoriales Olivar", icon: <Video className="text-rose-400" /> }
  ];

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 mb-12">
        <div className="flex justify-between w-full mb-8">
           <button 
            onClick={() => router.push('/cuaderno')}
            className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 shadow-xl">
             <HelpCircle size={24} />
          </div>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
        <h1 className="text-[32px] font-black text-white tracking-tighter text-center leading-tight mb-4">
          Centro de <span className="text-blue-400">Ayuda</span>
        </h1>
        <p className="text-white/40 font-medium text-center max-w-[280px]">Resuelve tus dudas sobre el Cuaderno Digital y normativas PAC.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input 
          type="text" 
          placeholder="Busca guías, tutoriales..."
          className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-[28px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 font-bold text-white text-base placeholder:text-white/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {faqs.map((faq, i) => (
          <GlassCard 
            key={i}
            className="p-6 flex flex-col items-start gap-4 hover:bg-white/[0.08] transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:bg-white/10 group-hover:scale-105 transition-all">
               {faq.icon}
            </div>
            <h4 className="font-black text-white text-sm leading-snug tracking-tight">{faq.q}</h4>
            <ChevronRight className="self-end text-white/10 group-hover:text-white transition-colors" size={16} />
          </GlassCard>
        ))}
      </div>

      {/* Support Section */}
      <div className="mb-12">
        <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.35em] px-1 mb-6">Asistencia Directa</h3>
        <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/[0.02] flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><LifeBuoy size={100} className="text-indigo-400" /></div>
          
          <div className="flex items-center gap-5 relative z-10">
             <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-xl border border-indigo-500/20">
                <MessageSquare size={24} />
             </div>
             <div>
                <h4 className="font-black text-white text-lg">Consultor PAC 24/7</h4>
                <p className="text-sm text-white/40 font-medium">Chat privado exclusivo para usuarios Premium.</p>
             </div>
          </div>
          
          <GlowButton variant="premium" className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl group relative z-10">
             Hablar con un experto <ChevronRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform" />
          </GlowButton>
          
          <div className="flex justify-between items-center text-white/20 pt-2 border-t border-white/5 relative z-10">
             <div className="flex items-center gap-2 text-[10px] uppercase font-black"><Phone size={12} /> +34 900 123 456</div>
             <div className="flex items-center gap-2 text-[10px] uppercase font-black">soporte@inagro.es</div>
          </div>
        </GlassCard>
      </div>

      {/* External Resources */}
      <div className="flex flex-col gap-3">
         <a href="https://www.mapa.gob.es/es/agricultura/temas/explotaciones-agricolas/siex/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all group border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest">Web Oficial SIEX / MAPA</span>
            <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" />
         </a>
         <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all group border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest">Manual de Usuario (PDF)</span>
            <BookOpen size={14} className="group-hover:rotate-12 transition-transform" />
         </a>
      </div>
    </div>
  );
}
