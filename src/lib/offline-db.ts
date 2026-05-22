import { openDB } from 'idb';

const DB_NAME = 'inagro-offline-db';
const STORE_NAME = 'pending_mutations';

export interface PendingMutation {
  id?: number;
  type: 'tratamiento' | 'fertilizacion';
  data: any;
  timestamp: number;
  error?: string; // Cache dynamic database error details if any sync fails
}

export async function getOfflineDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveMutation(mutation: PendingMutation): Promise<number> {
  const db = await getOfflineDB();
  return db.add(STORE_NAME, mutation);
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await getOfflineDB();
  return db.getAll(STORE_NAME);
}

export async function deleteMutation(id: number): Promise<void> {
  const db = await getOfflineDB();
  return db.delete(STORE_NAME, id);
}

export async function updateMutation(mutation: PendingMutation): Promise<number> {
  const db = await getOfflineDB();
  return db.put(STORE_NAME, mutation);
}

export async function clearQueue(): Promise<void> {
  const db = await getOfflineDB();
  return db.clear(STORE_NAME);
}
