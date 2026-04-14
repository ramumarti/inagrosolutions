"use client";

import { useI18n } from '@/lib/i18n';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SIEXReportProps {
  data: any;
}

export function SIEXReportTemplate({ data }: SIEXReportProps) {
  const { language } = useI18n();
  const { owner, tenant, explotaciones, activities } = data;

  const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy', { locale: es });

  return (
    <div className="bg-white text-slate-900 p-12 max-w-[1000px] mx-auto shadow-2xl print:shadow-none print:p-8 font-sans leading-relaxed min-h-screen">
      {/* SIEX Official Header */}
      <div className="flex border-4 border-slate-900 mb-8 items-stretch">
        <div className="bg-slate-900 p-6 flex items-center justify-center text-white w-48 text-center uppercase font-black tracking-tighter leading-none text-2xl">
          SIEX<br/>SI<br/>INAGRO
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center gap-1">
           <h1 className="text-3xl font-black uppercase text-slate-900">CUADERNO DE CAMPO DIGITAL PROFESIONAL</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">REGISTRO OFICIAL DE EXPLOTACIONES AGRARIAS (REA) - MINISTERIO DE AGRICULTURA</p>
        </div>
        <div className="w-48 p-6 flex flex-col items-center justify-center border-l-2 border-slate-200">
           {tenant?.logo_url ? <img src={tenant.logo_url} className="max-h-12 w-auto mb-2" /> : <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-300">LOGO</div>}
           <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-tighter">Powered by InagroSolutions</p>
        </div>
      </div>

      {/* 1. Titular de la Explotación */}
      <section className="mb-10">
         <div className="bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4 flex justify-between items-center">
            <h2 className="font-black text-sm uppercase">1. IDENTIFICACIÓN DEL TITULAR Y GESTOR</h2>
            <span className="text-[10px] font-bold text-slate-400">EXPIDIDO: {format(new Date(), 'PPpp', { locale: es })}</span>
         </div>
         <div className="grid grid-cols-12 gap-y-4 gap-x-8 px-4 text-sm">
            <div className="col-span-8">
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">Titular de la Explotación</p>
               <p className="font-bold border-b border-slate-100 pb-1">{owner?.first_name} {owner?.last_name}</p>
            </div>
            <div className="col-span-4">
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">NIF / CIF</p>
               <p className="font-bold border-b border-slate-100 pb-1">{owner?.nif || '—'}</p>
            </div>
            <div className="col-span-6">
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">Entidad Gestora</p>
               <p className="font-bold border-b border-slate-100 pb-1 italic">{tenant?.name || 'InagroSolutions Cloud'}</p>
            </div>
            <div className="col-span-6">
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">Email de Registro</p>
               <p className="font-bold border-b border-slate-100 pb-1">{owner?.email}</p>
            </div>
         </div>
      </section>

      {/* 2. Resumen de Explotaciones */}
      <section className="mb-10">
         <div className="bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4">
            <h2 className="font-black text-sm uppercase">2. INVENTARIO DE EXPLOTACIONES Y SUPERFICIES</h2>
         </div>
         <table className="w-full border-collapse border border-slate-200">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">
               <tr>
                  <th className="p-3 text-left border-r border-slate-200">Id. Explotación (REA)</th>
                  <th className="p-3 text-left border-r border-slate-200">Denominación</th>
                  <th className="p-3 text-left border-r border-slate-200">Ubicación</th>
                  <th className="p-3 text-right">Superficie (ha)</th>
               </tr>
            </thead>
            <tbody className="text-xs">
               {explotaciones.map((exp: any, i: number) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                     <td className="p-3 border-r border-slate-200 font-mono font-bold">{exp.codigo_rea || 'REA-GEN-001'}</td>
                     <td className="p-3 border-r border-slate-200 font-bold uppercase">{exp.nombre}</td>
                     <td className="p-3 border-r border-slate-200 uppercase">{exp.ubicacion || 'Sin datos'}</td>
                     <td className="p-3 text-right font-black">{exp.parcelas?.reduce((acc: any, p: any) => acc + (p.hectareas || 0), 0).toFixed(2)}</td>
                  </tr>
               ))}
               <tr className="bg-slate-900 text-white font-black text-sm">
                  <td colSpan={3} className="p-4 uppercase tracking-widest">Superficie Total Registrada</td>
                  <td className="p-4 text-right">
                     {explotaciones.reduce((acc: any, exp: any) => acc + exp.parcelas?.reduce((sub: any, p: any) => sub + (p.hectareas || 0), 0), 0).toFixed(2)}
                  </td>
               </tr>
            </tbody>
         </table>
      </section>

      {/* 3. Tratamientos Fitosanitarios */}
      <section className="mb-10 break-inside-avoid">
         <div className="bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4">
            <h2 className="font-black text-sm uppercase">3. REGISTRO DE TRATAMIENTOS FITOSANITARIOS (ART. 16 R.D. 1311/2012)</h2>
         </div>
         <table className="w-full border-collapse border border-slate-200">
            <thead className="bg-slate-800 text-white text-[9px] font-black uppercase tracking-tighter">
               <tr>
                  <th className="p-2 text-left border-r border-white/10">Fecha</th>
                  <th className="p-2 text-left border-r border-white/10">Parcelas / Recinto</th>
                  <th className="p-2 text-left border-r border-white/10">Plaga / Objetivo</th>
                  <th className="p-2 text-left border-r border-white/10">Producto Comercial</th>
                  <th className="p-2 text-right">Dosis (L/ha)</th>
               </tr>
            </thead>
            <tbody className="text-[10px] leading-tight">
               {activities.treatments.map((tr: any, i: number) => (
                  <tr key={i} className="border-b border-slate-200 even:bg-slate-50">
                     <td className="p-2 border-r border-slate-200 font-bold whitespace-nowrap">{formatDate(tr.fecha)}</td>
                     <td className="p-2 border-r border-slate-200 font-medium">
                        {tr.parcela?.nombre} - [{tr.parcela?.sigpac_recinto}]
                     </td>
                     <td className="p-2 border-r border-slate-200 font-bold text-red-700">{tr.plaga_objetivo || 'Genérica'}</td>
                     <td className="p-2 border-r border-slate-200 italic">{tr.producto_comercial} (RE: {tr.num_registro_rop})</td>
                     <td className="p-2 text-right font-black">{tr.dosis_total}</td>
                  </tr>
               ))}
               {activities.treatments.length === 0 && (
                  <tr>
                     <td colSpan={5} className="p-10 text-center uppercase tracking-widest font-black text-slate-200 italic">Sin actividad registrada en este periodo</td>
                  </tr>
               )}
            </tbody>
         </table>
      </section>

      {/* 4. Maquinaria y Personal (SIEX Compliance) */}
      <section className="mb-10 break-inside-avoid">
         <div className="bg-slate-100 px-4 py-2 border-l-4 border-slate-900 mb-4">
            <h2 className="font-black text-sm uppercase">4. TRAZABILIDAD DE MAQUINARIA Y OPERARIOS</h2>
         </div>
         <table className="w-full border-collapse border border-slate-200 text-[10px]">
            <thead className="bg-slate-50 border-b-2 border-slate-900 font-bold uppercase">
               <tr>
                  <th className="p-3 text-left border-r border-slate-200">Actividad Relacionada</th>
                  <th className="p-3 text-left border-r border-slate-200">Maquinaria / ROMA</th>
                  <th className="p-3 text-left">Asesor / Aplicador</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {activities.treatments.map((tr: any, i: number) => (
                  <tr key={i} className="align-top">
                     <td className="p-3 border-r border-slate-200 font-bold italic">{tr.producto_comercial}</td>
                     <td className="p-3 border-r border-slate-200">
                        {tr.maquinaria?.map((m: any, j: number) => (
                           <div key={j} className="mb-1">
                              <span className="font-black uppercase">{m.maquinaria.nombre}</span><br/>
                              <span className="text-[8px] text-slate-400 font-mono tracking-widest">{m.maquinaria.roma || 'SIN ROMA'}</span>
                           </div>
                        ))}
                     </td>
                     <td className="p-3">
                        {tr.personal?.map((p: any, j: number) => (
                           <div key={j} className="mb-1">
                              <span className="font-black uppercase">{p.workers.nombre}</span><br/>
                              <span className="text-[8px] text-slate-400">ROPO: {p.workers.carnet_ropo || 'NA'}</span>
                           </div>
                        ))}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </section>

      {/* SIEX Footer & Legal */}
      <div className="mt-20 border-t-4 border-slate-900 pt-8 flex flex-col items-center gap-6">
         <div className="flex gap-20 w-full justify-center">
            <div className="flex flex-col items-center">
               <div className="w-48 h-24 border border-slate-100 bg-slate-50/50 rounded flex items-center justify-center text-[8px] font-black text-slate-200 uppercase tracking-widest italic">Espacio para Firma del Titular</div>
               <p className="text-[10px] font-black mt-2 text-slate-900">{owner?.first_name} {owner?.last_name}</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-48 h-24 border border-slate-100 bg-slate-50/50 rounded flex items-center justify-center text-[8px] font-black text-slate-200 uppercase tracking-widest italic">Espacio para Sello de la Entidad</div>
               <p className="text-[10px] font-black mt-2 text-slate-900">{tenant?.name || 'InagroSolutions'}</p>
            </div>
         </div>
         <div className="text-center space-y-2 opacity-50">
            <p className="text-[8px] font-bold max-w-[600px] leading-tight">
               Este documento ha sido generado automáticamente de acuerdo con el esquema SIEX - Cuaderno Digital Profesonal. La veracidad de los datos es responsabilidad del titular y de la entidad gestora autorizada. Reporte auditado internamente bajo ID: EXP-{owner?.id.slice(0,8).toUpperCase()}
            </p>
         </div>
         <div className="bg-slate-900 px-6 py-3 rounded-full">
            <p className="text-[10px] font-black text-white italic tracking-[1em] ml-[1em]">INAGROSOLUTIONS</p>
         </div>
      </div>
    </div>
  );
}
