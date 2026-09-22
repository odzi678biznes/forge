import type { StoragePort } from './storage-port';
import { IndexedDbStorage } from './indexeddb-storage';

/**
 * Wybor trwalosci - jedyne miejsce w aplikacji, ktore wie, ze istnieja dwie
 * implementacje portu.
 *
 * W powloce Tauri uzywamy SQLite (Blueprint sek. 9). W zwyklej przegladarce -
 * podczas `npm run dev` i w testach - zostaje IndexedDB, dzieki czemu praca
 * nad interfejsem nie wymaga budowania calej powloki natywnej.
 */

/** Tauri 2 wstrzykuje ten obiekt do okna jeszcze przed startem aplikacji. */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function createStorage(): Promise<StoragePort> {
  if (!isTauri()) return new IndexedDbStorage();

  // Import dynamiczny: w zwyklej przegladarce wtyczka Tauri nie zostanie
  // nawet pobrana, wiec build webowy nie wywala sie na braku IPC.
  const { SqliteStorage } = await import('./sqlite-storage');
  return new SqliteStorage();
}
