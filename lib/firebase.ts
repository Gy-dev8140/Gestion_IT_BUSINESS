const generateId = () => Math.random().toString(36).substring(2, 9);

const getLocalData = (col: string) => {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(col) || "[]");
};
const setLocalData = (col: string, data: any[]) => {
  if (typeof window !== "undefined") window.localStorage.setItem(col, JSON.stringify(data));
};

let emitter: EventTarget;
if (typeof window !== "undefined") {
  emitter = new EventTarget();
}

export const db = {};

export const collection = (db: any, name: string) => name;
export const doc = (db: any, col: string, id: string) => ({ col, id });

export const addDoc = async (colName: string, data: any) => {
  const col = getLocalData(colName);
  const newDoc = { ...data, id: generateId() };
  col.push(newDoc);
  setLocalData(colName, col);
  if (emitter) emitter.dispatchEvent(new Event(colName));
  return newDoc;
};

export const getDocs = async (colName: string) => {
  const data = getLocalData(colName);
  return {
    docs: data.map((d: any) => ({
      id: d.id,
      data: () => d
    }))
  };
};

export const deleteDoc = async (docRef: { col: string, id: string }) => {
  const col = getLocalData(docRef.col);
  const filtered = col.filter((d: any) => d.id !== docRef.id);
  setLocalData(docRef.col, filtered);
  if (emitter) emitter.dispatchEvent(new Event(docRef.col));
};

export const updateDoc = async (docRef: { col: string, id: string }, data: any) => {
  const col = getLocalData(docRef.col);
  const idx = col.findIndex((d: any) => d.id === docRef.id);
  if (idx !== -1) {
    col[idx] = { ...col[idx], ...data };
    setLocalData(docRef.col, col);
    if (emitter) emitter.dispatchEvent(new Event(docRef.col));
  }
};

export const query = (colName: string, sortRef?: any) => ({ colName, sortRef });
export const orderBy = (field: string, dir: string) => ({ field, dir });

export const onSnapshot = (q: any, callback: (snapshot: any) => void) => {
  if (typeof window === "undefined") return () => {};
  
  const colName = typeof q === "string" ? q : q.colName;
  const sortRef = q.sortRef;
  
  const trigger = () => {
    let data = getLocalData(colName);
    if (sortRef && sortRef.field === 'createdAt') {
      data.sort((a: any, b: any) => {
         const tA = new Date(a.createdAt).getTime();
         const tB = new Date(b.createdAt).getTime();
         return sortRef.dir === 'desc' ? tB - tA : tA - tB;
      });
    }
    callback({
      docs: data.map((d: any) => ({
        id: d.id,
        data: () => d
      }))
    });
  };
  
  trigger();
  emitter.addEventListener(colName, trigger);
  
  const storageListener = (e: StorageEvent) => {
    if (e.key === colName) trigger();
  };
  window.addEventListener('storage', storageListener);
  
  return () => {
    emitter.removeEventListener(colName, trigger);
    window.removeEventListener('storage', storageListener);
  };
};
