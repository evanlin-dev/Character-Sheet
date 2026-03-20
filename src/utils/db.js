export const DB_NAME = 'DndDataDB';
export const STORE_NAME = 'files';
export const DB_VERSION = 7;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onblocked = () => {
      alert('Database upgrade blocked. Please close other tabs with this site open and reload.');
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

export async function checkDataLoaded() {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORE_NAME)) return false;

    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve, reject) => {
      const req = store.get('currentData');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return !!(data && data.length > 0);
  } catch (e) {
    console.error('Failed to check if data is loaded', e);
    return false;
  }
}