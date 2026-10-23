// Dieselbe IndexedDB wie die bisherige App („fangbuch-app“, Version 2, gleiche Stores).
// Dadurch sind alle vorhandenen Sessions, Gewässer, Vorschläge und Screenshots sofort da.
// Neue Bereiche (Lizenzen, Ausrüstung, Köderboxen, Karten, Regeln) liegen im Store „meta“.

export const DB_NAME = 'fangbuch-app';
export const STORES: Record<string, string> = { sessions: 'appId', gewaesser: 'slug', empfehlungen: 'id', meta: 'key', bilder: 'id' };

let idb: IDBDatabase | null = null;

export function openDb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('kein IndexedDB')); return; }
    const r = indexedDB.open(DB_NAME, 2);
    r.onupgradeneeded = () => {
      const d = r.result;
      Object.entries(STORES).forEach(([n, key]) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: key }); });
    };
    r.onsuccess = () => { idb = r.result; res(r.result); };
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('blockiert'));
  });
}

export function tx(stores: string[], mode: IDBTransactionMode, fn: (t: IDBTransaction) => void) {
  return new Promise<void>((res, rej) => {
    const t = idb!.transaction(stores, mode);
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error || new Error('abgebrochen'));
    fn(t);
  });
}

function req<T>(store: string, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((res, rej) => {
    const r = fn(idb!.transaction(store).objectStore(store));
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export const getAll = (store: string) => req<any[]>(store, (s) => s.getAll()).then((x) => x || []);
export const getKeys = (store: string) => req<IDBValidKey[]>(store, (s) => s.getAllKeys()).then((x) => x || []);
export const getOne = (store: string, key: string) => req<any>(store, (s) => s.get(key));
const plain = (o: any) => JSON.parse(JSON.stringify(o));
export const put = (store: string, obj: any) => tx([store], 'readwrite', (t) => { t.objectStore(store).put(plain(obj)); });
export const del = (store: string, key: string) => tx([store], 'readwrite', (t) => { t.objectStore(store).delete(key); });
export const putMeta = (key: string, value: any) => put('meta', { key, value });

// Schreibvorgänge nacheinander, damit sich zwei schnelle Tipps nicht überholen.
let chain: Promise<any> = Promise.resolve();
export function persist(store: string, obj: any, onFail?: () => void) {
  const p = chain.then(() => put(store, obj));
  chain = p.catch(() => {});
  if (onFail) p.catch(onFail);
  return p;
}
