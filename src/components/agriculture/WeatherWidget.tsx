"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, 
  Thermometer, Eye, ArrowUp, Loader2 
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  precipitation: number;
  uvIndex: number;
  daily: {
    tempMax: number[];
    tempMin: number[];
    precipSum: number[];
    dates: string[];
  };
}

const WEATHER_ICONS: Record<number, { icon: React.ReactNode; label: string }> = {
  0: { icon: <Sun className="w-8 h-8 text-yellow-400" />, label: 'Despejado' },
  1: { icon: <Sun className="w-8 h-8 text-yellow-300" />, label: 'Casi despejado' },
  2: { icon: <Cloud className="w-8 h-8 text-gray-300" />, label: 'Nubes parciales' },
  3: { icon: <Cloud className="w-8 h-8 text-gray-400" />, label: 'Nublado' },
  45: { icon: <Cloud className="w-8 h-8 text-gray-500" />, label: 'Niebla' },
  48: { icon: <Cloud className="w-8 h-8 text-gray-500" />, label: 'Niebla helada' },
  51: { icon: <CloudRain className="w-8 h-8 text-blue-300" />, label: 'Llovizna leve' },
  53: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, label: 'Llovizna' },
  55: { icon: <CloudRain className="w-8 h-8 text-blue-500" />, label: 'Llovizna intensa' },
  61: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, label: 'Lluvia leve' },
  63: { icon: <CloudRain className="w-8 h-8 text-blue-500" />, label: 'Lluvia moderada' },
  65: { icon: <CloudRain className="w-8 h-8 text-blue-600" />, label: 'Lluvia intensa' },
  71: { icon: <CloudSnow className="w-8 h-8 text-white" />, label: 'Nevada leve' },
  73: { icon: <CloudSnow className="w-8 h-8 text-white" />, label: 'Nevada' },
  80: { icon: <CloudRain className="w-8 h-8 text-blue-400" />, label: 'Chubascos' },
  95: { icon: <CloudRain className="w-8 h-8 text-purple-400" />, label: 'Tormenta' },
};

function getWeatherInfo(code: number) {
  return WEATHER_ICONS[code] || WEATHER_ICONS[Math.floor(code / 10) * 10] || WEATHER_ICONS[0];
}

export function WeatherWidget({ lat = 37.7796, lng = -3.7849, locationName = 'Tu explotación' }: { lat?: number; lng?: number; locationName?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FMadrid&forecast_days=5`
        );
        const data = await res.json();

        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          precipitation: data.current.precipitation,
          uvIndex: data.current.uv_index,
          daily: {
            tempMax: data.daily.temperature_2m_max,
            tempMin: data.daily.temperature_2m_min,
            precipSum: data.daily.precipitation_sum,
            dates: data.daily.time,
          }
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center h-[200px] border border-blue-500/10">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </GlassCard>
    );
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.weatherCode);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <GlassCard className="p-0 overflow-hidden border border-blue-500/10 bg-blue-500/[0.02]">
      {/* Current Weather */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{locationName}</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white tracking-tighter">{Math.round(weather.temperature)}°</span>
              <div className="pb-2">
                {info.icon}
              </div>
            </div>
            <p className="text-xs text-white/50 mt-1 font-medium">{info.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-right">
            <div className="flex items-center gap-2 justify-end">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-white/60">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-white/60">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <CloudRain className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-xs text-white/60">{weather.precipitation} mm</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs text-white/60">UV {weather.uvIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="grid grid-cols-5 gap-3">
          {weather.daily.dates.map((date, i) => {
            const d = new Date(date);
            const dayName = i === 0 ? 'Hoy' : dayNames[d.getDay()];
            const hasRain = weather.daily.precipSum[i] > 0;
            
            return (
              <div key={date} className="flex flex-col items-center gap-1.5 py-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{dayName}</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-white">{Math.round(weather.daily.tempMax[i])}°</span>
                  <span className="text-[10px] text-white/30">{Math.round(weather.daily.tempMin[i])}°</span>
                </div>
                {hasRain && (
                  <span className="text-[8px] text-blue-400 font-bold">{weather.daily.precipSum[i].toFixed(1)}mm</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
