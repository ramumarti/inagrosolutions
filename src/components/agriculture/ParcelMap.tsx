"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { MapPin, Layers, Maximize2, Loader2 } from 'lucide-react';

interface ParcelaData {
  id: string;
  nombre: string;
  hectareas: number;
  cultivo: string | null;
  variedad: string | null;
  sistema_riego: string | null;
  coordenadas: any;
}

const CROP_COLORS: Record<string, string> = {
  'Olivo': '#10B981',
  'Almendro': '#F59E0B',
  'Viña': '#8B5CF6',
  'Cereal': '#EAB308',
  'Hortaliza': '#22C55E',
  'Frutal': '#F97316',
};

export function ParcelMap({ className = '' }: { className?: string }) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [parcelas, setParcelas] = useState<ParcelaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const supabase = createClient();

  // Load parcelas from DB
  useEffect(() => {
    async function loadParcelas() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: exps } = await supabase
        .from('explotaciones')
        .select('id')
        .eq('user_id', user.id);

      if (!exps || exps.length === 0) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('parcelas')
        .select('*')
        .in('explotacion_id', exps.map(e => e.id));

      if (data) setParcelas(data);
      setLoading(false);
    }
    loadParcelas();
  }, [supabase]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || mapReady) return;

    let mounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mounted || !mapContainerRef.current || mapRef.current) return;

      // Default center: Jaén (olive oil capital)
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([37.7796, -3.7849], 13);

      // Dark satellite tile layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);

      // Labels overlay
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    }

    initMap();
    return () => { mounted = false; };
  }, [mapReady]);

  // Add parcela markers when data is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || parcelas.length === 0) return;

    const L = require('leaflet');
    const map = mapRef.current;
    const bounds: any[] = [];

    parcelas.forEach(parcela => {
      if (parcela.coordenadas?.lat && parcela.coordenadas?.lng) {
        const pos: [number, number] = [parcela.coordenadas.lat, parcela.coordenadas.lng];
        bounds.push(pos);

        const color = CROP_COLORS[parcela.cultivo || ''] || '#10B981';

        const icon = L.divIcon({
          className: 'custom-parcel-marker',
          html: `
            <div style="
              background: ${color}; 
              width: 32px; height: 32px; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex; align-items: center; justify-content: center;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        L.marker(pos, { icon })
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="font-weight: 800; font-size: 14px; margin: 0 0 4px;">${parcela.nombre}</h3>
              <p style="color: #666; font-size: 11px; margin: 0 0 8px;">
                ${parcela.cultivo || 'Sin cultivo'} ${parcela.variedad ? '(' + parcela.variedad + ')' : ''}
              </p>
              <div style="display: flex; gap: 12px; font-size: 11px;">
                <span><strong>${parcela.hectareas}</strong> ha</span>
                <span>${parcela.sistema_riego || 'Sin riego'}</span>
              </div>
            </div>
          `)
          .addTo(map);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [mapReady, parcelas]);

  return (
    <GlassCard className={`p-0 overflow-hidden border border-emerald-500/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mapa de Parcelas</h3>
            <p className="text-[10px] text-white/30">
              {parcelas.length} parcela{parcelas.length !== 1 ? 's' : ''} registrada{parcelas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/30 hover:text-emerald-400 transition-colors">
            <Layers className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/30 hover:text-emerald-400 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: '400px' }}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
        
        {/* Parcelas info overlay */}
        {!loading && parcelas.length > 0 && (
          <div className="absolute bottom-4 left-4 z-20 flex gap-2 flex-wrap">
            {parcelas.slice(0, 4).map(p => (
              <div 
                key={p.id} 
                className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 text-[10px]"
              >
                <span className="font-bold text-white">{p.nombre}</span>
                <span className="text-white/50 ml-2">{p.hectareas} ha</span>
              </div>
            ))}
          </div>
        )}

        {!loading && parcelas.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-xs">Sin parcelas con coordenadas registradas</p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
