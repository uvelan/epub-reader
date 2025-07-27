import { openDB } from 'idb';

const DB_NAME = 'BookDB';
const STORE_NAME = 'books';

export const initDB = async () => {
    return await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
};

export const saveBooksToDB = async (books: any[]) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear(); // always replace
    for (const book of books) {
        await store.put(book);
    }
    await tx.done;
};

export const getBooksFromDB = async (): Promise<any[]> => {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
};

export const clearBooksFromDB = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
};
