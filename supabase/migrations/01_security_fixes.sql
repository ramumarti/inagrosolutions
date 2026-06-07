-- 1. Recrear la vista resumen_diario con SECURITY INVOKER para respetar RLS
DROP VIEW IF EXISTS public.resumen_diario;

CREATE VIEW public.resumen_diario WITH (security_invoker = true) AS
 SELECT e.user_id,
    e.id AS explotacion_id,
    e.nombre AS nombre_explotacion,
    ( SELECT count(*) AS count
           FROM public.parcelas p
          WHERE (p.explotacion_id = e.id)) AS total_parcelas,
    ( SELECT COALESCE(sum(p.hectareas), (0)::numeric) AS "coalesce"
           FROM public.parcelas p
          WHERE (p.explotacion_id = e.id)) AS total_hectareas,
    ( SELECT count(*) AS count
           FROM (public.tratamientos_fitosanitarios t
             JOIN public.parcelas p ON ((t.parcela_id = p.id)))
          WHERE ((p.explotacion_id = e.id) AND ((t.fecha)::date = CURRENT_DATE))) AS tratamientos_hoy,
    ( SELECT count(*) AS count
           FROM (public.labores l
             JOIN public.parcelas p ON ((l.parcela_id = p.id)))
          WHERE ((p.explotacion_id = e.id) AND ((l.fecha)::date = CURRENT_DATE))) AS labores_hoy,
    ( SELECT count(*) AS count
           FROM public.alertas_cuaderno a
          WHERE ((a.user_id = e.user_id) AND (a.leida = false))) AS alertas_pendientes
   FROM public.explotaciones e;

-- 2. Asegurar el search_path en todas las funciones SECURITY DEFINER
ALTER FUNCTION public.get_auth_platform_role() SET search_path = public;
ALTER FUNCTION public.is_superadmin() SET search_path = public;
ALTER FUNCTION public.get_auth_tenant_id() SET search_path = public;
ALTER FUNCTION public.audit_record_changes() SET search_path = public;
ALTER FUNCTION public.check_user_access_parcela(_parcela_id UUID) SET search_path = public;

-- 3. Corregir política RLS permisiva en cuaderno_validaciones
DROP POLICY IF EXISTS "Tenant members can view validations" ON public.cuaderno_validaciones;

CREATE POLICY "Tenant members can view validations" ON public.cuaderno_validaciones 
FOR SELECT 
TO authenticated
USING (
  technician_id = (SELECT auth.uid()) OR 
  farmer_id = (SELECT auth.uid()) OR 
  (SELECT public.is_superadmin())
);
