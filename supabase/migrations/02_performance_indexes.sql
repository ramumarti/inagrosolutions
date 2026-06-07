-- 1. Crear índices en claves foráneas ausentes para optimizar JOINs y borrados en cascada
CREATE INDEX IF NOT EXISTS idx_tratamientos_fitosanitarios_user_id ON public.tratamientos_fitosanitarios(user_id);
CREATE INDEX IF NOT EXISTS idx_labores_user_id ON public.labores(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizaciones_user_id ON public.fertilizaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_campanas_user_id ON public.campanas(user_id);
CREATE INDEX IF NOT EXISTS idx_cosechas_user_id ON public.cosechas(user_id);
CREATE INDEX IF NOT EXISTS idx_inventario_insumos_user_id ON public.inventario_insumos(user_id);
CREATE INDEX IF NOT EXISTS idx_inventario_insumos_tenant_id ON public.inventario_insumos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_fitosanitarios_inventario_id ON public.tratamientos_fitosanitarios(inventario_id);
CREATE INDEX IF NOT EXISTS idx_fertilizaciones_inventario_id ON public.fertilizaciones(inventario_id);

-- 2. Optimización de RLS (reemplazar auth.uid() directo por select en caché)
-- Nota: La mayoría de las tablas críticas ya usan (SELECT auth.uid()) en sus políticas actuales.
-- Optimizamos payment_transactions, ai_credits, ai_usage_log
DROP POLICY IF EXISTS "Usuarios ven sus propias transacciones" ON public.payment_transactions;
CREATE POLICY "Usuarios ven sus propias transacciones" ON public.payment_transactions
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users see own credits" ON public.ai_credits;
CREATE POLICY "Users see own credits" ON public.ai_credits
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users see own usage" ON public.ai_usage_log;
CREATE POLICY "Users see own usage" ON public.ai_usage_log
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
