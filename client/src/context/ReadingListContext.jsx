import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { getStoredUser } from '../api.js';

const GUEST_STORAGE_KEY = 'northstar-reading-list';

export function readingListStorageKey(userId) {
  return userId == null
    ? GUEST_STORAGE_KEY
    : `${GUEST_STORAGE_KEY}:user:${userId}`;
}

function readStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.id != null)
      .map((item) => ({
        id: item.id,
        title: typeof item.title === 'string' ? item.title : '',
        author: typeof item.author === 'string' ? item.author : '',
      }));
  } catch {
    return [];
  }
}

function writeStoredList(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage can be full or blocked; the in-memory list still works.
  }
}

/** Only the fields the list needs are kept, so stored payloads stay small. */
function toListItem(book) {
  if (!book || book.id == null) return null;
  return {
    id: book.id,
    title: typeof book.title === 'string' ? book.title : '',
    author: typeof book.author === 'string' ? book.author : '',
  };
}

export function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK': {
      const item = toListItem(action.book);
      if (!item) return state;
      if (state.some((entry) => entry.id === item.id)) return state;
      return [...state, item];
    }
    case 'REMOVE_BOOK':
      return state.filter((entry) => entry.id !== action.id);
    case 'CLEAR_LIST':
      return [];
    case 'HYDRATE':
      return Array.isArray(action.items) ? action.items : [];
    default:
      return state;
  }
}

const ReadingListContext = createContext(null);

export function ReadingListProvider({ children }) {
  // A returning signed-in visitor should see their own saved list, not the guest one.
  const [activeUserId, setActiveUserId] = useState(
    () => getStoredUser()?.id ?? null,
  );
  const [items, dispatch] = useReducer(
    readingListReducer,
    activeUserId,
    (userId) => readStoredList(readingListStorageKey(userId)),
  );

  useEffect(() => {
    writeStoredList(readingListStorageKey(activeUserId), items);
  }, [items, activeUserId]);

  const addBook = useCallback((book) => {
    dispatch({ type: 'ADD_BOOK', book });
  }, []);

  const removeBook = useCallback((bookId) => {
    dispatch({ type: 'REMOVE_BOOK', id: bookId });
  }, []);

  const clearList = useCallback(() => {
    dispatch({ type: 'CLEAR_LIST' });
  }, []);

  const isInList = useCallback(
    (bookId) => items.some((entry) => entry.id === bookId),
    [items],
  );

  /**
   * Merge the guest list into the account list after login/register, then clear
   * the guest copy so books are never shown twice.
   */
  const mergeGuestList = useCallback((userId) => {
    if (userId == null) return;
    const key = readingListStorageKey(userId);
    const merged = new Map();
    for (const item of readStoredList(key)) merged.set(item.id, item);
    for (const item of readStoredList(GUEST_STORAGE_KEY)) merged.set(item.id, item);

    const nextItems = [...merged.values()];
    writeStoredList(key, nextItems);
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // Ignore storage failures; the merged account list is already saved.
    }

    dispatch({ type: 'HYDRATE', items: nextItems });
    setActiveUserId(userId);
  }, []);

  /** Point the list at a user's saved list, or back at the guest list on sign-out. */
  const switchUser = useCallback((userId) => {
    dispatch({
      type: 'HYDRATE',
      items: readStoredList(readingListStorageKey(userId)),
    });
    setActiveUserId(userId);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      activeUserId,
      addBook,
      removeBook,
      clearList,
      isInList,
      mergeGuestList,
      switchUser,
    }),
    [
      items,
      activeUserId,
      addBook,
      removeBook,
      clearList,
      isInList,
      mergeGuestList,
      switchUser,
    ],
  );

  return (
    <ReadingListContext.Provider value={value}>
      {children}
    </ReadingListContext.Provider>
  );
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) {
    throw new Error('useReadingList must be used inside a ReadingListProvider');
  }
  return context;
}
