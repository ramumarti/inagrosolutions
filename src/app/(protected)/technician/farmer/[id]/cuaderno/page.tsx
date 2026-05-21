import React from 'react';
import { getFarmerFullProfile, getFarmerCuadernoStatus } from '@/lib/actions/validaciones';
import ValidationHeader from './ValidationHeader';
import CuadernoClient from '@/components/cuaderno/CuadernoClient'; // We will attempt to reuse or adapt
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ campanaId?: string }>;
}

export default async function TecnicoCuadernoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const profile = await getFarmerFullProfile(id);
  
  if (!profile) {
    return (
      <div className="p-8">
        <GlassCard className="p-12 text-center max-w-lg mx-auto border-red-500/20">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Agricultor no encontrado</h2>
          <p className="text-sm text-white/40">No tienes acceso a este agricultor o el registro no existe.</p>
        </GlassCard>
      </div>
    );
  }

  const campanaId = searchParamsData.campanaId || (profile.campanas?.[0]?.id);
  const validationStatus = await getFarmerCuadernoStatus(id, campanaId || '');

  return (
    <div className="space-y-6">
      <ValidationHeader 
        farmerId={id} 
        campanaId={campanaId || ''} 
        initialStatus={validationStatus}
        farmerEmail={profile.email}
      />
      
      {/* 
          Notice: I'm wrapping the existing CuadernoClient but it needs to be 
          aware of the farmer profile. I will might need to refactor CuadernoClient 
          to be more flexible. For now, let's create a "Lite" version or see if 
          we can pass props.
      */}
      <div className="opacity-80 pointer-events-none grayscale-[0.2]">
         <p className="text-[10px] font-black uppercase text-white/20 mb-4 px-6 italic">
           Vista de solo lectura para el técnico supervisor
         </p>
         {/* Here we would render the farmer's content segments */}
         <GlassCard className="p-8">
            <h3 className="text-white font-bold mb-4">Módulos del Agricultor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {profile.explotaciones.map(e => (
                 <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-emerald-400">{e.nombre}</p>
                    <p className="text-[10px] text-white/40">{e.parcelas?.length || 0} parcelas registradas</p>
                 </div>
               ))}
            </div>
         </GlassCard>
      </div>
    </div>
  );
}
