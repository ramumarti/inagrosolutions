"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { MapPin, Layers, Maximize2, Loader2, MousePointer2, Save, Trash2 } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

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
  const [drawingMode, setDrawingMode] = useState(false);
  const [tempPolygon, setTempPolygon] = useState<any>(null);
  
  const supabase = createClient();

  // Load parcelas from DB
  const loadParcelas = async () => {
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
  };

  useEffect(() => {
    loadParcelas();
  }, [supabase]);

  // Initialize Leaflet map with Geoman
  useEffect(() => {
    if (typeof window === 'undefined' || mapReady) return;

    let mounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      await import('@geoman-io/leaflet-geoman-free');
      await import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');

      if (!mounted || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([37.7796, -3.7849], 13);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);

      // Add Geoman drawing tools controls
      (map as any).pm.setLang('es');
      (map as any).pm.addControls({
        position: 'topright',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        cutPolygon: false,
        removalMode: true,
        editMode: true,
      });

      // Global style for areas
      (map as any).pm.setGlobalOptions({ 
        templineStyle: { color: '#10B981' }, 
        hintlineStyle: { color: '#10B981', dashArray: [5, 5] },
        pathOptions: { color: '#10B981', fillColor: '#10B981', fillOpacity: 0.3 }
      });

      // Events for drawing
      map.on('pm:create', (e: any) => {
        const shape = e.layer;
        const geojson = shape.toGeoJSON();
        setTempPolygon(geojson);
        setDrawingMode(true);
      });

      map.on('pm:remove', (e: any) => {
        setTempPolygon(null);
        setDrawingMode(false);
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    }

    initMap();
    return () => { mounted = false; };
  }, [mapReady]);

  // Render stored parcelas
  useEffect(() => {
    if (!mapReady || !mapRef.current || parcelas.length === 0) return;

    const L = require('leaflet');
    const map = mapRef.current;
    
    // Clear previous layers if any (except background)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        if (!layer.pm_ignore) map.removeLayer(layer);
      }
    });

    const bounds: any[] = [];

    parcelas.forEach(parcela => {
      const color = CROP_COLORS[parcela.cultivo || ''] || '#10B981';

      // 1. If it's a polygon (coordenadas.type === 'Feature')
      if (parcela.coordenadas?.type === 'Feature' || parcela.coordenadas?.geometry) {
        const geojsonLayer = L.geoJSON(parcela.coordenadas, {
          style: { color, fillColor: color, fillOpacity: 0.2, weight: 2 },
          onEachFeature: (feature: any, layer: any) => {
             layer.bindPopup(`<strong>${parcela.nombre}</strong><br>${parcela.hectareas} ha`);
          }
        }).addTo(map);
        bounds.push(geojsonLayer.getBounds());
      } 
      // 2. If it's just a point (fallback)
      else if (parcela.coordenadas?.lat && parcela.coordenadas?.lng) {
        const pos: [number, number] = [parcela.coordenadas.lat, parcela.coordenadas.lng];
        bounds.push([pos, pos]);

        const icon = L.divIcon({
          className: 'custom-parcel-marker',
          html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker(pos, { icon }).addTo(map);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [mapReady, parcelas]);

  const saveNewParcel = async () => {
    if (!tempPolygon) return;
    // For now we just console log as the user would need to pick which parcel this belongs to
    // In a real flow, this would open a modal to select/create a parcel
    console.log("Saving geometry:", tempPolygon);
    alert("Geometría capturada. En una versión PRO, esto vincularía la parcela al Catastro/SIGPAC automáticamente.");
    setTempPolygon(null);
    setDrawingMode(false);
    if (mapRef.current) mapRef.current.pm.disableDraw();
  };

  return (
    <GlassCard className={`p-0 overflow-hidden border border-emerald-500/10 h-full relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">SIGPAC & Mapas Satelitales</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                {parcelas.length} Parcelas Activas
              </p>
            </div>
          </div>
        </div>

        {drawingMode ? (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
             <GlowButton variant="ghost" className="text-[10px] py-2 px-3 border-white/10" onClick={() => {
                setTempPolygon(null);
                setDrawingMode(false);
                if (mapRef.current) mapRef.current.pm.GlobalRemoval.disable();
             }}>
               <Trash2 className="w-3 h-3 mr-2" /> Cancelar
             </GlowButton>
             <GlowButton variant="primary" className="text-[10px] py-2 px-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]" onClick={saveNewParcel}>
               <Save className="w-3 h-3 mr-2" /> Guardar Área
             </GlowButton>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
               <button className="p-2 bg-emerald-600 rounded-md text-white shadow-lg" title="Dibujar Polígono">
                  <MousePointer2 className="w-3 h-3" />
               </button>
            </div>
            <button className="p-2 text-white/30 hover:text-emerald-400 transition-colors">
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-full min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
        
        {/* Leyenda crops */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          {Object.entries(CROP_COLORS).slice(0, 3).map(([crop, color]) => (
            <div key={crop} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">{crop}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
