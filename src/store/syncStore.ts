'use client';

import { create } from 'zustand';
import { 
  getPendingMutations, 
  saveMutation, 
  deleteMutation, 
  updateMutation,
  PendingMutation 
} from '@/lib/offline-db';
import { createClient } from '@/lib/supabase/client';

interface SyncStoreState {
  isOffline: boolean;
  pendingMutations: PendingMutation[];
  syncing: boolean;
  initialized: boolean;
  initOfflineSync: (toast: (msg: string, type?: 'success' | 'error' | 'info') => void) => Promise<void>;
  addMutation: (
    type: 'tratamiento' | 'fertilizacion', 
    data: any, 
    toast: (msg: string, type?: 'success' | 'error' | 'info') => void
  ) => Promise<void>;
  syncPendingMutations: (toast: (msg: string, type?: 'success' | 'error' | 'info') => void) => Promise<void>;
  removePendingMutation: (id: number) => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  isOffline: typeof window !== 'undefined' ? !window.navigator.onLine : false,
  pendingMutations: [],
  syncing: false,
  initialized: false,

  initOfflineSync: async (toast) => {
    if (get().initialized) return;

    // Load initial mutations
    try {
      const mutations = await getPendingMutations();
      set({ pendingMutations: mutations, initialized: true });
    } catch (e) {
      console.error('Failed to load pending mutations from IndexedDB:', e);
    }

    const updateOnlineStatus = () => {
      const online = window.navigator.onLine;
      set({ isOffline: !online });
      if (online) {
        toast('Conexión a Internet restablecida. Iniciando sincronización de datos...', 'info');
        get().syncPendingMutations(toast);
      } else {
        toast('Has perdido la conexión a Internet. El cuaderno guardará tus datos localmente.', 'info');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      set({ isOffline: !window.navigator.onLine });
    }
  },

  addMutation: async (type, data, toast) => {
    const newMutation: PendingMutation = {
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      const id = await saveMutation(newMutation);
      const mutationWithId = { ...newMutation, id };
      set((state) => ({
        pendingMutations: [...state.pendingMutations, mutationWithId],
      }));
      toast('Guardado localmente en campo sin cobertura. Se sincronizará automáticamente al recuperar conexión.', 'info');
    } catch (e) {
      console.error('Failed to save mutation to IndexedDB:', e);
      toast('Error al guardar localmente en IndexedDB.', 'error');
    }
  },

  syncPendingMutations: async (toast) => {
    const mutations = await getPendingMutations();
    if (mutations.length === 0) return;

    set({ syncing: true });
    const supabase = createClient();
    let successCount = 0;
    let failCount = 0;

    for (const mutation of mutations) {
      if (!mutation.id) continue;

      try {
        const table = mutation.type === 'tratamiento' ? 'tratamientos_fitosanitarios' : 'fertilizaciones';
        const { error } = await supabase.from(table).insert({
          ...mutation.data,
          // Guarantee ISO strings on dates
          fecha: new Date(mutation.data.fecha).toISOString(),
        });

        if (error) {
          throw error;
        }

        // Deletion from db and state
        await deleteMutation(mutation.id);
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => m.id !== mutation.id),
        }));
        successCount++;
      } catch (err: any) {
        console.error(`Offline sync failed for mutation ID ${mutation.id}:`, err);
        failCount++;
        const errorMessage = err.message || err.details || 'Error de base de datos';
        
        // Cache error on mutation, and store back to prevent endless retry loop
        const updatedMutation = { ...mutation, error: errorMessage };
        await updateMutation(updatedMutation);
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) => m.id === mutation.id ? updatedMutation : m),
        }));

        const itemName = mutation.data.nombre_producto || mutation.data.tipo_abono || 'Labor agrícola';
        toast(`Fallo al sincronizar "${itemName}": ${errorMessage}`, 'error');
      }
    }

    set({ syncing: false });

    if (successCount > 0) {
      toast(`¡Sincronización completada! ${successCount} labores subidas con éxito a la nube.`, 'success');
      // Trigger a page refresh or success reload if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline_sync_completed'));
      }
    }
  },

  removePendingMutation: async (id) => {
    try {
      await deleteMutation(id);
      set((state) => ({
        pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
      }));
    } catch (e) {
      console.error('Failed to remove pending mutation:', e);
    }
  },
}));
