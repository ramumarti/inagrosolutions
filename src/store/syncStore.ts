"use client";

import { create } from 'zustand';
import { getQueue, removeFromQueue, PendingMutation } from '@/lib/offline-db';
import { createClient } from '@/lib/supabase/client';

interface SyncState {
  isOnline: boolean;
  pendingItems: number;
  isSyncing: boolean;
  setOnline: (status: boolean) => void;
  checkQueue: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingItems: 0,
  isSyncing: false,

  setOnline: (status) => set({ isOnline: status }),

  checkQueue: async () => {
    const items = await getQueue();
    set({ pendingItems: items.length });
  },

  syncNow: async () => {
    const { isOnline, isSyncing } = get();
    if (!isOnline || isSyncing) return;

    set({ isSyncing: true });
    try {
      const items = await getQueue();
      if (items.length === 0) return;

      const supabase = createClient();

      for (const item of items) {
        if (item.action === 'INSERT') {
          const { error } = await supabase.from(item.table).insert(item.payload);
          if (!error) {
            await removeFromQueue(item.id);
          } else {
            console.error('Error syncing:', error);
          }
        }
        // UPDATE/DELETE can be implemented here...
      }
      
      const newItems = await getQueue();
      set({ pendingItems: newItems.length });
    } finally {
      set({ isSyncing: false });
    }
  }
}));
