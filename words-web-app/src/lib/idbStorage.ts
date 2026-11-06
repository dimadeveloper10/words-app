import { del, get, set } from 'idb-keyval';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

export function createIdbStorage<S>(): PersistStorage<S> {
  return {
    getItem: async (name) => {
      try {
        return (await get<StorageValue<S>>(name)) ?? null;
      } catch (error) {
        console.warn(`Unable to read "${name}" from IndexedDB`, error);
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        await set(name, value);
      } catch (error) {
        console.warn(`Unable to save "${name}" to IndexedDB`, error);
      }
    },
    removeItem: async (name) => {
      try {
        await del(name);
      } catch (error) {
        console.warn(`Unable to remove "${name}" from IndexedDB`, error);
      }
    },
  };
}
