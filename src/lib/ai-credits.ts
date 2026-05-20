import { createClient } from '@/lib/supabase/server';
import { TIER_CONFIG, type AgriTier } from '@/lib/modules';
import { AI_CREDIT_COSTS, AI_CREDIT_PACKS } from './ai-constants';

/**
 * Obtener o crear el registro de créditos del usuario para el mes actual
 */
export async function getOrCreateMonthlyCredits(userId: string): Promise<{
  credits_included: number;
  credits_purchased: number;
  credits_used: number;
  credits_remaining: number;
  period_start: string;
  period_end: string;
}> {
  const supabase = await createClient();
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  
  // Buscar registro existente para este mes
  const { data: existing } = await supabase
    .from('ai_credits')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .single();

  if (existing) {
    return {
      credits_included: existing.credits_included,
      credits_purchased: existing.credits_purchased,
      credits_used: existing.credits_used,
      credits_remaining: (existing.credits_included + existing.credits_purchased) - existing.credits_used,
      period_start: existing.period_start,
      period_end: existing.period_end,
    };
  }

  // Obtener el tier del usuario para saber cuántos créditos le corresponden
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = (user?.subscription_tier || 'basico') as AgriTier;
  const tierConfig = TIER_CONFIG[tier];
  const creditsIncluded = tierConfig?.ai_credits_monthly || 0;

  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

  // Crear registro para el mes actual
  const { data: newRecord, error } = await supabase
    .from('ai_credits')
    .insert({
      user_id: userId,
      credits_included: creditsIncluded,
      credits_purchased: 0,
      credits_used: 0,
      period_start: periodStart,
      period_end: periodEnd,
    })
    .select()
    .single();

  if (error) {
    // Si falla por unique constraint (race condition), buscar de nuevo
    const { data: retry } = await supabase
      .from('ai_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('period_start', periodStart)
      .single();

    if (retry) {
      return {
        credits_included: retry.credits_included,
        credits_purchased: retry.credits_purchased,
        credits_used: retry.credits_used,
        credits_remaining: (retry.credits_included + retry.credits_purchased) - retry.credits_used,
        period_start: retry.period_start,
        period_end: retry.period_end,
      };
    }
    throw new Error('Error al obtener créditos IA');
  }

  return {
    credits_included: newRecord.credits_included,
    credits_purchased: newRecord.credits_purchased,
    credits_used: newRecord.credits_used,
    credits_remaining: creditsIncluded,
    period_start: newRecord.period_start,
    period_end: newRecord.period_end,
  };
}

/**
 * Verificar si el usuario puede usar una función IA
 */
export async function canUseAIFeature(userId: string, feature: string): Promise<{
  allowed: boolean;
  creditsRemaining: number;
  creditsNeeded: number;
  upgradeMessage?: string;
}> {
  const creditsNeeded = AI_CREDIT_COSTS[feature] || 1;
  const credits = await getOrCreateMonthlyCredits(userId);

  if (credits.credits_remaining >= creditsNeeded) {
    return { allowed: true, creditsRemaining: credits.credits_remaining, creditsNeeded };
  }

  // Determinar mensaje de upgrade
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = (user?.subscription_tier || 'basico') as AgriTier;
  let upgradeMessage: string;

  if (tier === 'basico') {
    upgradeMessage = 'Tu plan Básico no incluye funciones de IA. Mejora a Intermedio o superior para acceder.';
  } else {
    upgradeMessage = `Has agotado tus ${credits.credits_included + credits.credits_purchased} créditos IA del mes. Compra un pack extra para seguir usando la IA.`;
  }

  return {
    allowed: false,
    creditsRemaining: credits.credits_remaining,
    creditsNeeded,
    upgradeMessage,
  };
}

/**
 * Consumir créditos después de una llamada exitosa a la IA
 */
export async function consumeCredits(
  userId: string,
  feature: string,
  metadata?: { input_summary?: string; response_time_ms?: number; success?: boolean }
): Promise<void> {
  const supabase = await createClient();
  const creditsToConsume = AI_CREDIT_COSTS[feature] || 1;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Incrementar credits_used
  await supabase.rpc('increment_ai_credits_used', {
    p_user_id: userId,
    p_period_start: periodStart,
    p_amount: creditsToConsume,
  }).then(async (res) => {
    // Si no existe la función RPC, hacer update directo
    if (res.error) {
      await supabase
        .from('ai_credits')
        .update({ 
          credits_used: (await getOrCreateMonthlyCredits(userId)).credits_used + creditsToConsume,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('period_start', periodStart);
    }
  });

  // Obtener tenant_id del usuario para el log
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  // Registrar en el log de uso
  await supabase.from('ai_usage_log').insert({
    user_id: userId,
    tenant_id: user?.tenant_id || null,
    feature,
    credits_consumed: creditsToConsume,
    input_summary: metadata?.input_summary || null,
    success: metadata?.success ?? true,
    response_time_ms: metadata?.response_time_ms || null,
  });
}

/**
 * Añadir créditos comprados (tras pago exitoso)
 */
export async function addPurchasedCredits(userId: string, amount: number): Promise<void> {
  const supabase = await createClient();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Asegurar que existe el registro del mes
  await getOrCreateMonthlyCredits(userId);

  // Sumar créditos comprados
  const { data: current } = await supabase
    .from('ai_credits')
    .select('credits_purchased')
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .single();

  await supabase
    .from('ai_credits')
    .update({ 
      credits_purchased: (current?.credits_purchased || 0) + amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('period_start', periodStart);
}
