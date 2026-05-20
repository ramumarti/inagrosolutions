// =============================================
// Módulos del Cuaderno Digital - Definición Central
// =============================================

export type AgriTier = 'basico' | 'intermedio' | 'avanzado' | 'premium';

export interface ModuloSistema {
  slug: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string;
  descripcion_en: string;
  icono: string;
  es_obligatorio: boolean;
  tier_minimo: AgriTier;
  precio_addon: number;
  orden: number;
}

export const TIER_CONFIG: Record<AgriTier, {
  label_es: string;
  label_en: string;
  max_ha: number;
  price_monthly: number;
  price_annual: number;
  ai_credits_monthly: number;
  color: string;
  gradient: string;
}> = {
  basico: {
    label_es: 'Básico',
    label_en: 'Basic',
    max_ha: 5,
    price_monthly: 4.99,
    price_annual: 49.90,
    ai_credits_monthly: 0,
    color: '#6366F1',
    gradient: 'from-indigo-500 to-indigo-700',
  },
  intermedio: {
    label_es: 'Intermedio',
    label_en: 'Intermediate',
    max_ha: 20,
    price_monthly: 19.99,
    price_annual: 199.90,
    ai_credits_monthly: 15,
    color: '#3B82F6',
    gradient: 'from-blue-500 to-blue-700',
  },
  avanzado: {
    label_es: 'Avanzado',
    label_en: 'Advanced',
    max_ha: 50,
    price_monthly: 49.99,
    price_annual: 499.90,
    ai_credits_monthly: 50,
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-violet-700',
  },
  premium: {
    label_es: 'Premium',
    label_en: 'Premium',
    max_ha: 100,
    price_monthly: 89.99,
    price_annual: 899.90,
    ai_credits_monthly: 150,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-amber-700',
  },
};

export const TIER_ORDER: AgriTier[] = ['basico', 'intermedio', 'avanzado', 'premium'];

export function canAccessModule(userTier: AgriTier, moduleTierMinimo: AgriTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(moduleTierMinimo);
}

export function suggestTier(hectareas: number): AgriTier {
  if (hectareas <= 5) return 'basico';
  if (hectareas <= 20) return 'intermedio';
  if (hectareas <= 50) return 'avanzado';
  return 'premium';
}

export function isModuleActive(
  moduleSlug: string,
  modulosActivos: string[],
  userTier: AgriTier,
  moduleTierMinimo: AgriTier,
  esObligatorio: boolean
): boolean {
  if (esObligatorio) return true;
  if (!canAccessModule(userTier, moduleTierMinimo)) return false;
  return modulosActivos.includes(moduleSlug);
}
