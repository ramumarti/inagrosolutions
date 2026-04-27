"use client";

import { CheckCircle2, MailOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center space-y-8 animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-indigo-500/20 border border-indigo-500/30 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
          <MailOpen className="w-12 h-12 text-indigo-400" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight">Revisa tu bandeja de entrada</h1>
          <p className="text-white/60 leading-relaxed text-sm">
            Hemos enviado un correo electrónico con un enlace mágico para confirmar tu registro como Partner. 
            <br/><br/>
            Haz clic en él para acceder a tu panel y configurar tu plataforma <strong className="text-white font-bold">Marca Blanca</strong>.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Próximos pasos
          </h3>
          <ul className="space-y-3 text-sm text-white/50">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-black">1.</span>
              Confirma tu dirección de email.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-black">2.</span>
              Sube el logo de tu cooperativa y elige tu color corporativo.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-black">3.</span>
              Conecta tu cuenta de Stripe para empezar a recibir comisiones.
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <GlowButton variant="secondary" className="w-full py-4 text-sm font-bold">
              Ir al Inicio de Sesión <ArrowRight className="ml-2 w-4 h-4" />
            </GlowButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
