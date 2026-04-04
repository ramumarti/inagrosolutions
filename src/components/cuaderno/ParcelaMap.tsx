'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

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
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 relative z-10 box-border shadow-2xl">
      <MapContainer 
        center={initialCenter} 
        zoom={16} 
        maxZoom={20}
        minZoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Layer Switcher */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {/* We can add buttons here later */}
        </div>

        {/* 1. Base Layer: PNOA Satélite (Oficial España - WMS) */}
        <WMSTileLayer
          url="https://www.ign.es/wms-pnoa/pnoa-ma"
          layers="OI.OrthoimageCoverage"
          format="image/jpeg"
          version="1.3.0"
          attribution='&copy; <a href="http://www.ign.es/ign/main/index.do">IGN</a>'
          maxZoom={20}
        />

        {/* 2. Overlay: SIGPAC Mosaico (Oficial - WMS) */}
        <WMSTileLayer
          url="https://wms.mapa.gob.es/sigpac/wms"
          layers="PARCELA,RECINTO"
          format="image/png"
          transparent={true}
          version="1.3.0"
          attribution="SIGPAC - MAPA"
          opacity={0.7}
          maxZoom={20}
        />

        {!readOnly && <MapEventsHandler onPlotSelect={onPlotSelect} />}
        
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest pointer-events-none flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Visor SIGPAC Oficial (Mosaico Activo)
      </div>
    </div>
  );
}
