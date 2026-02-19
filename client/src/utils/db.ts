import { openDB } from 'idb';
import { get, set, del } from 'idb-keyval';

const READER_PREFIX = "reader-";
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

export async function saveChaptersContent(bookId: string, content: any[]) {
    await set(`${READER_PREFIX}${bookId}-content`, content);
}

export async function getChaptersContent(bookId: string): Promise<any[] | undefined> {
    return await get(`${READER_PREFIX}${bookId}-content`);
}

export function saveSelectedChapter(bookId: string, selectedIndex: number) {
    localStorage.setItem(`${READER_PREFIX}${bookId}-selectedItem`, String(selectedIndex));
}

export function getSelectedChapter(bookId: string): number | null {
    const val = localStorage.getItem(`${READER_PREFIX}${bookId}-selectedItem`);
    return val !== null && !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null;
}

export function saveSentenceIndex(bookId: string, sentenceIndex: number) {
    localStorage.setItem(`${READER_PREFIX}${bookId}-sentenceIndex`, String(sentenceIndex));
}

export function getSentenceIndex(bookId: string): number | null {
    const val = localStorage.getItem(`${READER_PREFIX}${bookId}-sentenceIndex`);
    return val !== null && !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : null;
}

export function saveSelectedVoice(bookId: string, voiceURI: string) {
    localStorage.setItem(`${READER_PREFIX}${bookId}-selectedVoice`, voiceURI);
}

export function getSelectedVoice(bookId: string): string | null {
    return localStorage.getItem(`${READER_PREFIX}${bookId}-selectedVoice`);
}

export async function deleteChaptersContent(bookId: string) {
    await del(`${READER_PREFIX}${bookId}-content`);
}

export function saveOfflinePref(isOffline: boolean) {
    localStorage.setItem(`${READER_PREFIX}offlinePref`, String(isOffline));
}

export function getOfflinePref(): boolean {
    const val = localStorage.getItem(`${READER_PREFIX}offlinePref`);
    // Default to true if not set (Offline Mode by default)
    return val === null ? true : val === 'true';
}

export function saveFontSize(size: number) {
    localStorage.setItem(`${READER_PREFIX}fontSize`, String(size));
}

export function getFontSize(): number {
    const val = localStorage.getItem(`${READER_PREFIX}fontSize`);
    return val ? parseFloat(val) : 18; // Default 18px
}

export function saveFontFamily(font: string) {
    localStorage.setItem(`${READER_PREFIX}fontFamily`, font);
}

export function getFontFamily(): string {
    return localStorage.getItem(`${READER_PREFIX}fontFamily`) || "'Georgia', serif";
}