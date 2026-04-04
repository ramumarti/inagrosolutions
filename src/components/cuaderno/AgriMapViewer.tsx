'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geoman-free/dist/leaflet-geoman.css';
import { 
  MapPin, Layers, Maximize2, MousePointer2, 
  Map as MapIcon, X, Info, LayersIcon, Search
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';

// Carga dinámica de Leaflet para evitar errores de SSR en Next.js
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const FeatureGroup = dynamic(() => import('react-leaflet').then(mod => mod.FeatureGroup), { ssr: false });

interface AgriMapViewerProps {
  parcelas: any[];
  onSelectParcela?: (id: string) => void;
}

export function AgriMapViewer({ parcelas, onSelectParcela }: AgriMapViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'satelite' | 'terreno' | 'callejero'>('satelite');

  // Convertimos datos de BD a GeoJSON para Leaflet
  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: parcelas.filter(p => p.geometria).map(p => ({
        type: 'Feature',
        id: p.id,
        properties: { 
            name: p.nombre, 
            cultivo: p.cultivo, 
            hectareas: p.hectareas,
            id: p.id
        },
        geometry: p.geometria // El formato GeoJSON de PostGIS es compatible directo
      }))
    };
  }, [parcelas]);

  const mapCenter: [number, number] = [38.0125, -3.3854]; // Centro por defecto (Jaén/Úbeda) para AgTech

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      click: (e: any) => {
        setSelectedId(feature.properties.id);
        if (onSelectParcela) onSelectParcela(feature.properties.id);
      },
      mouseover: (e: any) => {
        e.target.setStyle({ fillOpacity: 0.8, weight: 3 });
      },
      mouseout: (e: any) => {
        e.target.setStyle({ fillOpacity: 0.5, weight: 2 });
      }
    });
  };

  const style = (feature: any) => ({
    fillColor: '#10b981', // Emerald 500
    color: '#059669', // Emerald 600
    weight: 2,
    opacity: 1,
    fillOpacity: selectedId === feature.properties.id ? 0.8 : 0.4
  });

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 group">
      {/* Map Loader Marker (Always SSR ready) */}
      <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center -z-10">
        <MapPin className="text-white/10 animate-bounce" size={40} />
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        className="w-full h-full z-0 outline-none"
        // @ts-ignore
        zoomControl={false}
      >
        {mapType === 'satelite' ? (
          <TileLayer 
             url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
             attribution="&copy; Google Satellite"
          />
        ) : (
          <TileLayer 
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             attribution="&copy; OpenStreetMap"
          />
        )}

        <FeatureGroup>
            {/* @ts-ignore */}
            <GeoJSON 
                data={geojson as any} 
                style={style} 
                onEachFeature={onEachFeature} 
            />
        </FeatureGroup>
      </MapContainer>

      {/* Floating UI Controls */}
      <div className="absolute top-6 left-6 flex flex-col gap-3">
          <GlassCard className="p-2 flex flex-col gap-2 border-white/10 bg-black/40 backdrop-blur-md">
            <button 
                onClick={() => setMapType('satelite')}
                className={`p-3 rounded-xl transition-all ${mapType === 'satelite' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
                <LayersIcon size={18} />
            </button>
            <button 
                onClick={() => setMapType('callejero')}
                className={`p-3 rounded-xl transition-all ${mapType === 'callejero' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
                <Layers size={18} />
            </button>
          </GlassCard>
      </div>

      {/* Selection Card Overlay */}
      {selectedId && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-80 animate-in slide-in-from-bottom-4 duration-500">
              <GlassCard className="p-6 border-emerald-500/30 bg-black/80 backdrop-blur-xl relative overflow-hidden">
                <button 
                    onClick={() => setSelectedId(null)}
                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
                {parcelas.filter(p => p.id === selectedId).map(p => (
                    <div key={p.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 text-emerald-400">
                                <MapIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">{p.nombre}</h4>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{p.cultivo} • {p.variedad}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Superficie</p>
                                <p className="text-sm font-black text-white">{p.hectareas} <span className="text-[10px]">ha</span></p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sigpac</p>
                                <p className="text-sm font-black text-white">{p.poligono}/{p.parcela}</p>
                            </div>
                        </div>
                        <GlowButton className="w-full py-3 h-auto text-[10px] font-black uppercase tracking-widest" onClick={() => onSelectParcela && onSelectParcela(p.id)}>
                            Ver Detalles Cuaderno
                        </GlowButton>
                    </div>
                ))}
              </GlassCard>
          </div>
      )}

      {/* Map Search Overlay */}
      <div className="absolute top-6 right-6 hidden md:block">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center px-4 py-2 w-64 ring-1 ring-white/5">
                <Search size={14} className="text-white/30" />
                <input 
                    type="text" 
                    placeholder="Buscar finca..." 
                    className="bg-transparent border-none text-[10px] font-black uppercase text-white outline-none px-3 w-full placeholder:text-white/20"
                />
          </div>
      </div>
      
      {/* Disclaimer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                <Info size={10} className="text-emerald-400" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Visor Georeferenciado • EPSG:4326</span>
          </div>
      </div>
    </div>
  );
}
