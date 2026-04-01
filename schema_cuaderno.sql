-- Schema Core: Explotaciones y Parcelas

CREATE TABLE IF NOT EXISTS public.explotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  num_registro_siex TEXT,
  total_hectareas NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.explotaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own explotaciones" ON public.explotaciones;
CREATE POLICY "Users can access their own explotaciones" ON public.explotaciones FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explotacion_id UUID NOT NULL REFERENCES public.explotaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  referencia_sigpac TEXT,
  hectareas NUMERIC NOT NULL,
  cultivo TEXT,
  variedad TEXT,
  sistema_riego TEXT,
  coordenadas JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own parcelas" ON public.parcelas;
CREATE POLICY "Users can access their own parcelas" ON public.parcelas FOR ALL
USING (
  explotacion_id IN (SELECT id FROM public.explotaciones WHERE user_id = auth.uid())
)
WITH CHECK (
  explotacion_id IN (SELECT id FROM public.explotaciones WHERE user_id = auth.uid())
);

-- Schema Legales: Tratamientos Fitosanitarios
CREATE TABLE IF NOT EXISTS public.tratamientos_fitosanitarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL,
  producto_mapa_id TEXT,
  nombre_producto TEXT NOT NULL,
  dosis NUMERIC NOT NULL,
  unidad_dosis TEXT,
  superficie_tratada NUMERIC,
  maquinaria_usada TEXT,
  operario TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tratamientos_fitosanitarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own tratamientos" ON public.tratamientos_fitosanitarios;
CREATE POLICY "Access own tratamientos" ON public.tratamientos_fitosanitarios FOR ALL
USING (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p 
    JOIN public.explotaciones e ON p.explotacion_id = e.id 
    WHERE e.user_id = auth.uid()
  )
)
WITH CHECK (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p 
    JOIN public.explotaciones e ON p.explotacion_id = e.id 
    WHERE e.user_id = auth.uid()
  )
);

-- Schema Legales: Labores
CREATE TABLE IF NOT EXISTS public.labores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL,
  tipo_labor TEXT NOT NULL,
  descripcion TEXT,
  superficie_afectada NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.labores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own labores" ON public.labores;
CREATE POLICY "Access own labores" ON public.labores FOR ALL
USING (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()
  )
)
WITH CHECK (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()
  )
);

-- Schema Legales: Fertilizaciones
CREATE TABLE IF NOT EXISTS public.fertilizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL,
  tipo_abono TEXT NOT NULL,
  dosis NUMERIC NOT NULL,
  unidad_dosis TEXT,
  n_p_k TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fertilizaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own fertilizaciones" ON public.fertilizaciones;
CREATE POLICY "Access own fertilizaciones" ON public.fertilizaciones FOR ALL
USING (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()
  )
)
WITH CHECK (
  parcela_id IN (
    SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()
  )
);

-- Schema Premium: Costes
CREATE TABLE IF NOT EXISTS public.costes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explotacion_id UUID NOT NULL REFERENCES public.explotaciones(id) ON DELETE CASCADE,
  parcela_id UUID REFERENCES public.parcelas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL,
  concepto TEXT NOT NULL,
  categoria TEXT,
  importe NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.costes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own costes" ON public.costes;
CREATE POLICY "Access own costes" ON public.costes FOR ALL
USING (explotacion_id IN (SELECT id FROM public.explotaciones WHERE user_id = auth.uid()))
WITH CHECK (explotacion_id IN (SELECT id FROM public.explotaciones WHERE user_id = auth.uid()));

-- Schema Premium: Trazabilidad
CREATE TABLE IF NOT EXISTS public.trazabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  lote TEXT NOT NULL,
  fecha_cosecha TIMESTAMPTZ,
  cantidad_kg NUMERIC,
  destino_comercial TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trazabilidad ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own trazabilidad" ON public.trazabilidad;
CREATE POLICY "Access own trazabilidad" ON public.trazabilidad FOR ALL
USING (parcela_id IN (SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()))
WITH CHECK (parcela_id IN (SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()));

-- Schema Premium: Lecturas Sensores
CREATE TABLE IF NOT EXISTS public.lecturas_sensores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  sensor_id TEXT NOT NULL,
  tipo_medicion TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  fecha_lectura TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lecturas_sensores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access own sensores" ON public.lecturas_sensores;
CREATE POLICY "Access own sensores" ON public.lecturas_sensores FOR ALL
USING (parcela_id IN (SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()))
WITH CHECK (parcela_id IN (SELECT p.id FROM public.parcelas p JOIN public.explotaciones e ON p.explotacion_id = e.id WHERE e.user_id = auth.uid()));
