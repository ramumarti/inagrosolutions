'use client';

import { useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function SuperadminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Superadmin Route Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full p-8">
      <GlassCard className="p-8 max-w-xl text-center border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-4">Error Crítico en Superadmin</h2>
        <p className="text-white/80 mb-6 bg-red-950/30 p-4 rounded-lg font-mono text-sm text-left overflow-x-auto">
          {error.message || 'Error desconocido'}
          {error.stack && <br />}
          {error.stack}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-bold"
        >
          Intentar Recuperar
        </button>
      </GlassCard>
    </div>
  );
}
