'use client';

import React, { useEffect, useState } from 'react';
import { getPlatformStats } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Building2, Map, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminPage() {
  return (
    <div className="p-10 bg-emerald-900/40 rounded-xl border border-emerald-500 m-8 text-center text-emerald-300 font-bold text-3xl">
      ¡CONEXIÓN ESTABLECIDA, PANEL SUPERADMIN EN CURSO DE CARGA!
    </div>
  );
}
