import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class FarmService {
  static async getAll() {
    const { data, error } = await supabase
      .from('explotaciones')
      .select('*, parcelas(*)');
    if (error) throw error;
    return data;
  }

  static async create(body: { nombre: string; superficie: number; user_id?: string }) {
    const { data, error } = await supabase
      .from('explotaciones')
      .insert({
        nombre: body.nombre,
        total_hectareas: body.superficie,
        user_id: body.user_id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('explotaciones')
      .select('*, parcelas(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
}
