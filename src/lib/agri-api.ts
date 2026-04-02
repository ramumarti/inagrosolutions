const AGRI_BACKEND_URL = process.env.NEXT_PUBLIC_AGRI_BACKEND_URL || 'http://localhost:3001';

export class AgriApiService {
  
  private static async request(endpoint: string, method: string = 'GET', body?: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${AGRI_BACKEND_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'API Request failed' }));
      throw new Error(err.message || 'API Request failed');
    }

    return res.json();
  }

  // --- AUTH ---
  static async login(email: string, id: number) {
    return this.request('/auth/login', 'POST', { email, id });
  }

  static async register(userData: any) {
    return this.request('/auth/register', 'POST', userData);
  }

  // --- FARMS & PARCELS ---
  static async getFarms(token: string) {
    return this.request('/farms', 'GET', null, token);
  }

  static async createFarm(name: string, hectareas: number, token: string) {
    return this.request('/farms', 'POST', { nombre: name, superficie_total: hectareas }, token);
  }

  // --- TREATMENTS ---
  static async createTreatment(data: any, token: string) {
    return this.request('/treatments', 'POST', data, token);
  }

  static async getSiexExport(token: string) {
    return this.request('/export/siex', 'GET', null, token);
  }
}
