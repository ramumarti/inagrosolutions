"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Billing Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-20 bg-white/5 border border-white/10 rounded-2xl">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-bold text-white">¡Ups! Algo se ha roto internamente</h2>
      <div className="p-4 bg-black/50 rounded-lg w-full overflow-auto">
        <p className="text-red-400 font-mono text-sm break-words">{error.message}</p>
        {error.stack && (
          <pre className="text-white/40 text-xs mt-2 overflow-x-auto">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
      >
        Reintentar
      </button>
    </div>
  );
}
