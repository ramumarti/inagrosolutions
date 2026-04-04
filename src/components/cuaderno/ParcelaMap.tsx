'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { Search, Map } from 'lucide-react';

// Fix Leaflet icons
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface ParcelaMapProps {
  initialCenter?: [number, number];
  onPlotSelect?: (data: any) => void;
  readOnly?: boolean;
  geometria?: any;
}

// Sub-component to handle map interaction
function MapEventsHandler({ onPlotSelect }: { onPlotSelect?: (data: any) => void }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      // En un caso real, aquí llamaríamos al servicio de identificación de SIGPAC
      // a través de un proxy para evitar CORS, o usando GetFeatureInfo del WMS
      console.log('Clicked at:', lat, lng);
      
      // Simulación de identificación:
      if (onPlotSelect) {
        onPlotSelect({
          lat,
          lng,
          // Mocking data found at coordinate
          mockId: true
        });
      }
    },
  });

  // Enable Geoman drawing if needed
  useEffect(() => {
    if (map) {
      // @ts-ignore
      map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true,
      });
      
      // @ts-ignore
      map.on('pm:create', (e: any) => {
        const shape = e.layer.toGeoJSON();
        console.log('Created geometry:', shape);
        // Dispatch event or callback with geojson
      });
    }
  }, [map]);

  return null;
}

export function ParcelaMap({ initialCenter = [40.416775, -3.703790], onPlotSelect, readOnly, geometria }: ParcelaMapProps) {
  const [search, setSearch] = useState({ prov: '', mun: '', pol: '', par: '' });
  const mapRef = useRef<L.Map>(null);

  const handleSearch = () => {
    // En un caso real, consultaríamos la API de SIGPAC para obtener las coordenadas de esa parcela
    // por ahora simulamos un zoom a una zona
    if (mapRef.current) {
      mapRef.current.flyTo(initialCenter, 18);
      // Opcionalmente identificar la parcela automáticamente
      if (onPlotSelect) {
        onPlotSelect({ lat: initialCenter[0], lng: initialCenter[1], ...search });
      }
    }
  };

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-white/10 relative z-10 box-border shadow-2xl group">
      <MapContainer 
        center={initialCenter} 
        zoom={16} 
        maxZoom={20}
        minZoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        {/* SIGPAC Search UI (Replicating official FEGA logic) */}
        <div className="absolute top-4 left-14 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-72 flex flex-col gap-3 group-hover:scale-105 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Search size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[2px] text-white">Buscador SIGPAC</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/30 uppercase">Provincia</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="23"
                  value={search.prov}
                  onChange={e => setSearch({...search, prov: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/30 uppercase">Municipio</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="46"
                  value={search.mun}
                  onChange={e => setSearch({...search, mun: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/30 uppercase">Polígono</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="13"
                  value={search.pol}
                  onChange={e => setSearch({...search, pol: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/30 uppercase">Parcela</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500/50 outline-none transition-all"
                  placeholder="333"
                  value={search.par}
                  onChange={e => setSearch({...search, par: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              Localizar Parcela
            </button>
          </div>
        </div>

        {/* 1. Base Layer: PNOA Satélite (IGN España - Alta Disponibilidad) */}
        <TileLayer
          url="https://wmts-pnoa.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}"
          attribution='&copy; <a href="http://www.ign.es/ign/main/index.do">IGN</a>'
          maxZoom={20}
        />

        {/* 2. Overlay: SIGPAC Mosaico (MAPA España - Alta Disponibilidad) */}
        <TileLayer
          url="https://mapas.mapa.gob.es/wmts/sigpac/default/sigpac/GoogleMapsCompatible/{z}/{x}/{y}.png"
          attribution="SIGPAC - MAPA"
          opacity={0.7}
          maxZoom={20}
          zIndex={10}
        />

        {!readOnly && <MapEventsHandler onPlotSelect={onPlotSelect} />}
        
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest pointer-events-none flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Visor SIGPAC Integrado (FEGA Core)
      </div>
    </div>
  );
}
