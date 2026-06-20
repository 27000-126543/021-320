import { create } from 'zustand';
import type { Manga, HiatusRecord, UpdateType } from '../types/manga';
import { storage, mangaStorage } from '../utils/storage';
import { generateId, formatDate, getWeekdayOfNextN, addWeeks, parseDate, addDays } from '../utils/date';
import { mockMangas, mockHiatusRecords } from '../data/mockMangas';

interface MangaState {
  mangas: Manga[];
  hiatusRecords: HiatusRecord[];
  initialized: boolean;

  init: () => void;
  addManga: (data: Omit<Manga, 'id' | 'createdAt' | 'nextUpdateDate'>) => void;
  updateManga: (id: string, data: Partial<Manga>) => void;
  deleteManga: (id: string) => void;

  markAsRead: (id: string, type: UpdateType) => void;
  addHiatus: (data: Omit<HiatusRecord, 'id' | 'createdAt'>) => void;
  removeHiatus: (id: string) => void;

  getMangasByWeekday: (weekday: number) => Manga[];
  getTodayMangas: () => Manga[];
  getUpcomingHiatus: () => HiatusRecord[];
  getMangaById: (id: string) => Manga | undefined;
  isMangaInHiatus: (mangaId: string, dateStr: string) => boolean;
  getEffectiveNextUpdateDate: (manga: Manga) => string;
}

export const useMangaStore = create<MangaState>((set, get) => ({
  mangas: [],
  hiatusRecords: [],
  initialized: false,

  init: () => {
    const state = get();
    if (state.initialized) return;

    let storedMangas = storage.get<Manga[]>(mangaStorage.getKey(), []);
    let storedHiatus = storage.get<HiatusRecord[]>(mangaStorage.getHiatusKey(), []);

    if (storedMangas.length === 0) {
      storedMangas = mockMangas;
      storedHiatus = mockHiatusRecords;
      storage.set(mangaStorage.getKey(), storedMangas);
      storage.set(mangaStorage.getHiatusKey(), storedHiatus);
    }

    set({
      mangas: storedMangas,
      hiatusRecords: storedHiatus,
      initialized: false
    });

    const updatedMangas = storedMangas.map(manga => ({
      ...manga,
      nextUpdateDate: get().getEffectiveNextUpdateDate(manga)
    }));

    set({
      mangas: updatedMangas,
      hiatusRecords: storedHiatus,
      initialized: true
    });
    console.log('[MangaStore] initialized', { mangas: updatedMangas.length, hiatus: storedHiatus.length });
  },

  addManga: (data) => {
    const newManga: Manga = {
      ...data,
      id: generateId(),
      createdAt: formatDate(new Date()),
      nextUpdateDate: ''
    };
    newManga.nextUpdateDate = get().getEffectiveNextUpdateDate(newManga);
    const mangas = [...get().mangas, newManga];
    set({ mangas });
    storage.set(mangaStorage.getKey(), mangas);
    console.log('[MangaStore] addManga:', newManga.name);
  },

  updateManga: (id, data) => {
    const mangas = get().mangas.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...data };
        updated.nextUpdateDate = get().getEffectiveNextUpdateDate(updated);
        return updated;
      }
      return m;
    });
    set({ mangas });
    storage.set(mangaStorage.getKey(), mangas);
    console.log('[MangaStore] updateManga:', id);
  },

  deleteManga: (id) => {
    const mangas = get().mangas.filter(m => m.id !== id);
    const hiatusRecords = get().hiatusRecords.filter(h => h.mangaId !== id);
    set({ mangas, hiatusRecords });
    storage.set(mangaStorage.getKey(), mangas);
    storage.set(mangaStorage.getHiatusKey(), hiatusRecords);
    console.log('[MangaStore] deleteManga:', id);
  },

  markAsRead: (id, type) => {
    const today = formatDate(new Date());
    const mangas = get().mangas.map(m => {
      if (m.id === id) {
        let newCurrent = m.currentChapter;
        let newLastRead = m.lastReadChapter;
        if (type === 'main') {
          newLastRead = m.currentChapter;
        } else if (type === 'bonus') {
          newCurrent = m.currentChapter + 1;
          newLastRead = newCurrent;
        }
        const updated = {
          ...m,
          lastReadChapter: newLastRead,
          lastReadDate: today,
          lastUpdateType: type,
          currentChapter: newCurrent
        };
        updated.nextUpdateDate = get().getEffectiveNextUpdateDate(updated);
        return updated;
      }
      return m;
    });
    set({ mangas });
    storage.set(mangaStorage.getKey(), mangas);
    console.log('[MangaStore] markAsRead:', id, type);
  },

  addHiatus: (data) => {
    const newRecord: HiatusRecord = {
      ...data,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    const hiatusRecords = [...get().hiatusRecords, newRecord];
    set({ hiatusRecords });
    storage.set(mangaStorage.getHiatusKey(), hiatusRecords);

    const mangas = get().mangas.map(m => {
      if (m.id === data.mangaId) {
        const updated = { ...m };
        updated.nextUpdateDate = get().getEffectiveNextUpdateDate(updated);
        return updated;
      }
      return m;
    });
    set({ mangas });
    storage.set(mangaStorage.getKey(), mangas);
    console.log('[MangaStore] addHiatus:', newRecord.id);
  },

  removeHiatus: (id) => {
    const record = get().hiatusRecords.find(h => h.id === id);
    const hiatusRecords = get().hiatusRecords.filter(h => h.id !== id);
    set({ hiatusRecords });
    storage.set(mangaStorage.getHiatusKey(), hiatusRecords);

    if (record) {
      const mangas = get().mangas.map(m => {
        if (m.id === record.mangaId) {
          const updated = { ...m };
          updated.nextUpdateDate = get().getEffectiveNextUpdateDate(updated);
          return updated;
        }
        return m;
      });
      set({ mangas });
      storage.set(mangaStorage.getKey(), mangas);
    }
    console.log('[MangaStore] removeHiatus:', id);
  },

  getMangasByWeekday: (weekday) => {
    return get().mangas.filter(m => m.weekday === weekday);
  },

  getTodayMangas: () => {
    const today = formatDate(new Date());
    const state = get();
    return state.mangas.filter(m => {
      const effectiveDate = state.getEffectiveNextUpdateDate(m);
      return effectiveDate === today;
    });
  },

  getUpcomingHiatus: () => {
    const today = formatDate(new Date());
    return get().hiatusRecords.filter(h => {
      const startDate = parseDate(h.startWeekDate);
      const endDate = addWeeks(startDate, h.weeksCount);
      const todayDate = parseDate(today);
      return todayDate <= endDate;
    });
  },

  getMangaById: (id) => {
    return get().mangas.find(m => m.id === id);
  },

  isMangaInHiatus: (mangaId, dateStr) => {
    const state = get();
    const targetDate = parseDate(dateStr);
    return state.hiatusRecords.some(h => {
      if (h.mangaId !== mangaId) return false;
      const startDate = parseDate(h.startWeekDate);
      const endDate = addDays(addWeeks(startDate, h.weeksCount), -1);
      return targetDate >= startDate && targetDate <= endDate;
    });
  },

  getEffectiveNextUpdateDate: (manga) => {
    const today = formatDate(new Date());
    let nextUpdate = getWeekdayOfNextN(manga.weekday, 0);
    if (formatDate(nextUpdate) < today) {
      nextUpdate = getWeekdayOfNextN(manga.weekday, 1);
    }

    const state = get();
    let maxAttempts = 20;
    while (maxAttempts > 0 && state.isMangaInHiatus(manga.id, formatDate(nextUpdate))) {
      nextUpdate = addDays(nextUpdate, 7);
      maxAttempts--;
    }

    return formatDate(nextUpdate);
  }
}));
