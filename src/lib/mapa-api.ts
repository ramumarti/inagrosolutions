export interface ProductoMAPA {
  numRegistro: string;
  nombreComercial: string;
  titular: string;
  materiaActiva: string;
  estado: string;
}

export interface MapaApiResponse {
  success: boolean;
  count: number;
  data: ProductoMAPA[];
  error?: string;
}

/**
 * Busca productos fitosanitarios por nombre comercial o principio activo
 * a través de nuestro proxy conectado a la base de datos del MAPA.
 */
export async function searchProductosMAPA(query: string): Promise<ProductoMAPA[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(`/api/mapa/productos?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const json: MapaApiResponse = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Error desconocido del servidor');
    }

    return json.data;
  } catch (error) {
    console.error('Fallo en searchProductosMAPA:', error);
    // En caso de estar Offline, podríamos buscar en una mini-base de datos IndexedDB en caché
    return [];
  }
}
