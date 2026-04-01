import { openDB, DBSchema } from 'idb';

export interface PendingMutation {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
}

interface CuadernoDB extends DBSchema {
  sync_queue: {
    key: string;
    value: PendingMutation;
    indexes: { 'by-timestamp': number };
  };
}

const dbPromise = typeof window !== 'undefined' 
  ? openDB<CuadernoDB>('cuaderno-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    })
  : null;

export const addToQueue = async (mutation: Omit<PendingMutation, 'id' | 'timestamp'>) => {
  const db = await dbPromise;
  if (!db) return;
  const item: PendingMutation = {
    ...mutation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await db.put('sync_queue', item);
  return item;
};

export const getQueue = async () => {
  const db = await dbPromise;
  if (!db) return [];
  return await db.getAllFromIndex('sync_queue', 'by-timestamp');
};

export const removeFromQueue = async (id: string) => {
  const db = await dbPromise;
  if (!db) return;
  await db.delete('sync_queue', id);
};
