import { createClient } from "@/lib/supabase/server";

export interface Farm {
  id?: string;
  user_id?: string;
  nombre: string;
  superficie: number;
  provincia?: string;
  siex_id?: string;
}

export const FarmService = {
  async getAll() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('explotaciones')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  },

  async create(farm: Omit<Farm, 'id' | 'user_id'>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('explotaciones')
      .insert({ ...farm, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('explotaciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
