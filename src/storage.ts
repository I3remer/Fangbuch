// Fotos der Foto-Felder (Karten, Lizenzen, Boxen, Köder, Ausrüstung). Sie liegen wie die Screenshots
// im Store „bilder“ der App-Datenbank, unter der id „slot:<Feld>“.
import { del } from './lib/db';
import { bildData, forgetBild, storeImage } from './lib/fangbuch';

const key = (id: string) => 'slot:' + id;
const listeners = new Map<string, Set<() => void>>();
const notify = (id: string) => listeners.get(id)?.forEach((fn) => fn());

export function onPhotoChange(id: string, fn: () => void) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id)!.add(fn);
  return () => { listeners.get(id)?.delete(fn); };
}

export const getPhoto = (id: string) => bildData(key(id));

// Karten und Fotos etwas größer als Screenshots, damit man in Tiefenkarten zoomen kann.
export async function setPhoto(id: string, file: Blob) {
  await storeImage(file, key(id), 2200, 0.8);
  notify(id);
}

export async function removePhoto(id: string) {
  await del('bilder', key(id));
  forgetBild(key(id));
  notify(id);
}

export async function requestPersistentStorage() {
  try { await navigator.storage?.persist?.(); } catch { /* nicht unterstützt */ }
}
