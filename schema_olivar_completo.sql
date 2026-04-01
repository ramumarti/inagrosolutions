-- # 1. TABLES & SCHEMA FOR OLIVE GROVE DIGITAL NOTEBOOK (NORMATIVA ESPAÑOLA)

-- ## Extensions and Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ## 2. Usuarios (already partially exists in Supabase auth.users, sync for role-based metadata)
-- Note: Assuming a 'profiles' table for user roles and extra info linked to 'auth.users'
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT UNIQUE,
  rol TEXT CHECK (rol IN ('agricultor', 'tecnico', 'administrador')) DEFAULT 'agricultor',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ## 3. Explotaciones
CREATE TABLE IF NOT EXISTS public.explotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  num_registro_siex TEXT, -- Registro de Explotaciones Agrarias
  superficie_total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ## 4. Parcelas
CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explotacion_id UUID NOT NULL REFERENCES public.explotaciones(id) ON DELETE CASCADE,
  referencia_sigpac TEXT NOT NULL, -- Provincia.Municipio.Agregado.Zona.Poligono.Parcela.Recinto
  nombre TEXT,
  superficie NUMERIC NOT NULL,
  tipo_olivar TEXT CHECK (tipo_olivar IN ('tradicional', 'intensivo', 'superintensivo')),
  sistema_produccion TEXT CHECK (sistema_produccion IN ('convencional', 'integrado', 'ecologico')),
  variedad TEXT, -- Picual, Arbequina, Hojiblanca, etc.
  sistema_riego TEXT CHECK (sistema_riego IN ('secano', 'regadio')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ## 5. Tratamientos Fitosanitarios
CREATE TABLE IF NOT EXISTS public.tratamientos_fitosanitarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  producto TEXT NOT NULL,
  numero_registro TEXT, -- Registro oficial MAPA
  materia_activa TEXT,
  dosis NUMERIC,
  volumen_caldo NUMERIC, -- Litros/ha
  plaga_objetivo TEXT,
  metodo_aplicacion TEXT,
  aplicador TEXT,
  carnet_aplicador TEXT,
  plazo_seguridad INTEGER, -- Días
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 6. Fertilizacion
CREATE TABLE IF NOT EXISTS public.fertilizacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo TEXT CHECK (tipo IN ('organico', 'mineral')),
  producto TEXT NOT NULL,
  cantidad NUMERIC,
  metodo TEXT,
  justificacion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 7. Labores
CREATE TABLE IF NOT EXISTS public.labores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo_labor TEXT NOT NULL,
  maquinaria TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 8. Riegos
CREATE TABLE IF NOT EXISTS public.riegos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  volumen NUMERIC, -- m3 or liters
  sistema TEXT,
  frecuencia TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 9. Plagas (Monitoreo)
CREATE TABLE IF NOT EXISTS public.plagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo_plaga TEXT NOT NULL, -- Mosca, Prais, Algodon, Repilo
  nivel NUMERIC, -- % of infestation
  umbral NUMERIC, -- threshold
  recomendacion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 10. Residuos
CREATE TABLE IF NOT EXISTS public.residuos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo TEXT,
  gestion TEXT, -- punto limpio, empresa gestora
  punto_entrega TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ## 11. Produccion (Cosecha)
CREATE TABLE IF NOT EXISTS public.produccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha_recoleccion TIMESTAMPTZ NOT NULL DEFAULT now(),
  cantidad NUMERIC, -- kg
  destino TEXT, -- almazara name
  lote TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- # RLS POLICIES (MULTI-TENANCY)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamientos_fitosanitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residuos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produccion ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Helper (simple user access)
CREATE OR REPLACE FUNCTION public.check_user_access_parcela(_parcela_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.parcelas p
    JOIN public.explotaciones e ON p.explotacion_id = e.id
    WHERE p.id = _parcela_id AND e.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Profiles
CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (id = auth.uid());

-- Policies for Explotaciones
CREATE POLICY "Users access own explotaciones" ON public.explotaciones FOR ALL USING (user_id = auth.uid());

-- Policies for Parcelas
CREATE POLICY "Users access own parcelas" ON public.parcelas FOR ALL USING (
  explotacion_id IN (SELECT id FROM public.explotaciones WHERE user_id = auth.uid())
);

-- Policies for all registries (Generic approach for this demo)
CREATE POLICY "Users access own registros fitosanitarios" ON public.tratamientos_fitosanitarios FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own fertilizaciones" ON public.fertilizacion FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own labores" ON public.labores FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own riegos" ON public.riegos FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own plagas" ON public.plagas FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own residuos" ON public.residuos FOR ALL USING (public.check_user_access_parcela(parcela_id));
CREATE POLICY "Users access own produccion" ON public.produccion FOR ALL USING (public.check_user_access_parcela(parcela_id));
