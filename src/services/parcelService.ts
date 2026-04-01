import { createClient } from "@/lib/supabase/server";

export interface Parcel {
  id?: string;
  explotacion_id: string;
  nombre: string;
  hectareas: number;
  cultivo?: string;
  variedad?: string;
  sistema_riego?: string;
  coordenadas?: any;
}

export const ParcelService = {
  async getAllByFarm(farmId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('parcelas')
      .select('*')
      .eq('explotacion_id', farmId);

    if (error) throw error;
    return data;
  },

  async create(parcel: Omit<Parcel, 'id'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('parcelas')
      .insert(parcel)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGeometry(id: string, geojson: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('parcelas')
      .update({ coordenadas: geojson })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
