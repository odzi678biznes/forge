import type { PreparedPhoto } from './image-upload';
export interface PendingPhoto { id: string; base: string; connectionTag: string; sessionId: string; exerciseId: string; confidence: string; photo: PreparedPhoto }
const DB = 'forge-tutor-outbox-v1';
async function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('photos', mode), req = operation(tx.objectStore('photos'));
    tx.oncomplete = () => { database.close(); resolve(req.result); };
    tx.onabort = tx.onerror = () => { database.close(); reject(tx.error || new Error('Nie udało się zapisać zdjęcia na urządzeniu.')); };
  });
}
export const savePending = (photo: PendingPhoto) => transact('readwrite', store => store.put(photo));
export const deletePending = (id: string) => transact('readwrite', store => store.delete(id));
export const loadPending = () => transact('readonly', store => store.getAll()) as Promise<PendingPhoto[]>;
