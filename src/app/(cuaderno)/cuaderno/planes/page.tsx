"use client";

import { useState } from "react";
import { Check, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "basic",
    name: "Plan Básico",
    price: "0€",
    description: "Cumple con lo legal sin coste alguno.",
    features: [
      "Cuaderno Fitosanitario Básico",
      "Exportación SIEX/PAC (Manual)",
      "Hasta 5 hectáreas de finca",
      "Funcionamiento 100% Offline"
    ],
    buttonText: "Tu Plan Actual",
    priceId: null,
    isPopular: false,
  },
  {
    id: "premium",
    name: "Plan Pro Analítica",
    price: "19€",
    description: "Toda la potencia de los datos en tu campo.",
    features: [
      "Todo en el Básico",
      "Dashboards de Rendimiento y ROI",
      "Trazabilidad de Cosecha",
      "Geolocalización SIGPAC",
      "Integración Directa con SIEX",
      "Control de Costes y Insumos"
    ],
    buttonText: "Obtener Plan Pro",
    // En producción, aquí pondrías el ID real de Stripe (ej: price_12345)
    priceId: "price_mock_premium_2026",
    isPopular: true,
  }
];

export default function PlanesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) return;
    
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      
      const { url, error } = await res.json();
      
      if (error) throw new Error(error);
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al conectar con Stripe: " + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="pt-6">
        <button onClick={() => router.back()} className="mb-4 p-2 bg-white rounded-full text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Potencia tu cuaderno</h1>
        <p className="text-gray-500 text-sm mt-1">Selecciona el plan que mejor se adapte a tu explotación.</p>
      </div>

      <div className="space-y-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-6 rounded-3xl border ${plan.isPopular ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white'} shadow-sm flex flex-col gap-6`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 right-6 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Recomendado
              </span>
            )}

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-[150px]">{plan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-xs font-bold block">/mes</span>
              </div>
            </div>

            <div className="space-y-3">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className={`shrink-0 ${plan.isPopular ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleCheckout(plan.priceId)}
              disabled={!plan.priceId || loading !== null}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg shadow-lg ${
                !plan.priceId 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98] shadow-gray-200'
              }`}
            >
              {loading === plan.priceId ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                  Conectando...
                </span>
              ) : (
                <>{plan.buttonText} {plan.priceId && <ArrowRight size={20} />}</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex gap-4">
        <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
        <div>
          <p className="text-sm font-bold text-indigo-900">Pagos Seguros con Stripe</p>
          <p className="text-xs text-indigo-800/70 mt-1 leading-relaxed">Tus datos bancarios nunca se almacenan en nuestros servidores. Cancela o cambia de plan cuando quieras desde tu panel.</p>
        </div>
      </div>
    </div>
  );
}
