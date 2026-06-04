'use client';

import { useState } from 'react';
import { FileCheck, ArrowRight } from 'lucide-react';
import { FarmerDemoModal } from './FarmerDemoModal';

interface FarmerDemoButtonProps {
  tenant: any;
  primaryColor: string;
  className?: string;
  variant?: 'hero' | 'solution' | 'cta';
}

export function FarmerDemoButton({ tenant, primaryColor, className = '', variant = 'hero' }: FarmerDemoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'solution') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg ${className}`}
          style={{ backgroundColor: primaryColor, color: '#000' }}
        >
          Demo de Cuaderno Digital para el Agricultor
          <ArrowRight className="w-5 h-5" />
        </button>
        <FarmerDemoModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tenant={tenant}
          primaryColor={primaryColor}
        />
      </>
    );
  }

  // default to hero/cta variant (dark button with check document icon)
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 ${
          variant === 'hero' ? 'backdrop-blur-md' : ''
        } ${className}`}
      >
        <FileCheck className="w-5 h-5" style={{ color: primaryColor }} />
        Demo de Cuaderno Digital para el Agricultor
      </button>
      <FarmerDemoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tenant={tenant}
        primaryColor={primaryColor}
      />
    </>
  );
}
