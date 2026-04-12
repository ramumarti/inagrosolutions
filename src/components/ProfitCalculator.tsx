'use client';

import React, { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, DollarSign, Users } from 'lucide-react';
import { GlowButton } from './ui/GlowButton';
import { GlassCard } from './ui/GlassCard';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfitCalculator = ({ isOpen, onClose }: CalculatorProps) => {
  const [counts, setCounts] = useState({
    small: 0,    // < 5 ha
    medium: 0,   // 5 - 20 ha
    large: 0,    // 20 - 50 ha
    premium: 0,  // 50 - 100 ha
  });

  const prices = {
    small: 9.99,
    medium: 19.99,
    large: 49.99,
    premium: 89.99,
  };

  const [results, setResults] = useState({
    totalMonthly: 0,
    partnerMonthly: 0,
    partnerYearly: 0,
  });

  useEffect(() => {
    const total = 
      (counts.small * prices.small) + 
      (counts.medium * prices.medium) + 
      (counts.large * prices.large) + 
      (counts.premium * prices.premium);
    
    const partner = total * 0.5;
    
    setResults({
      totalMonthly: total,
      partnerMonthly: partner,
      partnerYearly: partner * 12,
    });
  }, [counts]);

  if (!isOpen) return null;

  const handleInputChange = (key: keyof typeof counts, value: string) => {
    const num = parseInt(value) || 0;
    setCounts(prev => ({ ...prev, [key]: Math.max(0, num) }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[var(--color-base-100)] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              <Calculator className="text-black w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Calculadora de Beneficios</h2>
              <p className="text-white/40 text-sm italic">Estima tus ingresos recurrentes como partner</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-white/60 mb-2">Asociados por tamaño de finca</label>
                
                <div className="space-y-4">
                  {[
                    { id: 'small', label: 'Menos de 5 ha', price: 9.99 },
                    { id: 'medium', label: 'De 5 a 20 ha', price: 19.99 },
                    { id: 'large', label: 'De 20 a 50 ha', price: 49.99 },
                    { id: 'premium', label: 'De 50 a 100 ha', price: 89.99 },
                  ].map((cat) => (
                    <div key={cat.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 focus-within:border-[var(--color-primary)]/40 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold">{cat.label}</div>
                        <input 
                          type="number" 
                          min="0"
                          value={counts[cat.id as keyof typeof counts] || ''}
                          onChange={(e) => handleInputChange(cat.id as keyof typeof counts, e.target.value)}
                          placeholder="0"
                          className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-right font-bold text-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-tight">Cuota mensual: <span className="text-white/80">{cat.price}€/usuario</span></div>
                        <div className="text-[10px] text-[var(--color-primary)]/60 font-black uppercase tracking-tight text-right">Tu 50%: {(cat.price * 0.5).toFixed(2)}€/u</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent border border-[var(--color-primary)]/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-24 h-24 text-[var(--color-primary)]" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Tu beneficio mensual (50%)</div>
                    <div className="text-5xl font-black">{results.partnerMonthly.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Ingreso Anual Estimado</div>
                    <div className="text-3xl font-bold text-white/80">{results.partnerYearly.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/30 italic">
                    <Users className="w-3 h-3" />
                    Asociados totales: {Object.values(counts).reduce((a, b) => a + b, 0)}
                  </div>
                </div>
              </div>

              <GlowButton 
                variant="primary" 
                className="mt-6 py-4 rounded-2xl w-full text-lg"
                onClick={() => window.location.href = '/signup'}
              >
                EMPEZAR AHORA
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
