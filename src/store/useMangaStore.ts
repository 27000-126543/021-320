import { create } from 'zustand';
import type { Manga, HiatusRecord, UpdateType, ReadHistory } from '../types/manga';
import { storage, mangaStorage } from '../utils/storage';
import { generateId, formatDate, getWeekdayOfNextN, addWeeks, parseDate, addDays, addWeeks as _addWeeks } from '../utils/date';
import { mockMangas, mockHiatusRecords } from '../data/mockMangas';

const READ_HISTORY_KEY = 'manga_tracker_read_history';

export interface ResumingInfo {
  record: HiatusRecord;
  manga: Manga;
  resumeDate: string;
  weeksCount: number;
}

interface MangaState {
  mangas: Manga[];
  hiatusRecords: HiatusRecord[];
  readHistories: ReadHistory[];
  initialized: boolean;

  init: () => void;
  addManga: (data: Omit<Manga, 'id' | 'createdAt' | 'nextUpdateDate'>) => void;
  updateManga: (id: string, data: Partial<Manga>) => void;
  deleteManga: (id: string) => void;

  markAsRead: (id: string, type: UpdateType, note?: string) => void;
  addReadHistory: (history: Omit<ReadHistory, 'id'>) => void;
  getReadHistoryByMangaId: (mangaId: string) => ReadHistory[];

  addHiatus: (data: Omit<HiatusRecord, 'id' | 'createdAt'>) => void;
  removeHiatus: (id: string) => void;

  getMangasByWeekday: (weekday: number) => Manga[];
  getTodayMangas: () => Manga[];
  getTodayNominalMangas: () => { manga: Manga; status: 'normal' | 'hiatus'; resumeDate?: string }[];
  getResumingTomorrow: () => ResumingInfo[];
  getUpcomingHiatus: () => HiatusRecord[];
  getExpiredHiatus: () => HiatusRecord[];
  getHiatusByStatus: (status: 'active' | 'expired' | 'all') => HiatusRecord[];
  getMangaById: (id: string) => Manga | undefined;
  isMangaInHiatus: (mangaId: string, dateStr: string) => boolean;
  getActiveHiatusForManga: (mangaId: string) => HiatusRecord | undefined;
  getEffectiveNextUpdateDate: (manga: Manga) => string;
}

export const useMangaStore = create<MangaState>((set, get) => ({
  mangas: [],
  hiatusRecords: [],
  readHistories: [],
  initialized: false,

  init: () => {
    const state = get();
    if (state.initialized) return;

    let storedMangas = storage.get<Manga[]>(mangaStorage.getKey(), []);
    let storedHiatus = storage.get<HiatusRecord[]>(mangaStorage.getHiatusKey(), []);
    let storedHistories = storage.get<ReadHistory[]>(READ_HISTORY_KEY, []);

    if (storedMangas.length === 0) {
      storedMangas = mockMangas;
      storedHiatus = mockHiatusRecords;
      storage.set(mangaStorage.getKey(), storedMangas);
      storage.set(mangaStorage.getHiatusKey(), storedHiatus);
      storage.set(READ_HISTORY_KEY, storedHistories);
    }

    set({
      mangas: storedMangas,
      hiatusRecords: storedHiatus,
      readHistories: storedHistories,
      initialized: false
    });

    const updatedMangas = storedMangas.map(manga => ({
      ...manga,
      nextUpdateDate: get().getEffectiveNextUpdateDate(manga)
    }));

    set({
      mangas: updatedMangas,
      hiatusRecords: storedHiatus,
      readHistories: storedHistories,
      initialized: true
    });
    console.log('[MangaStore] initialized', {
      mangas: updatedMangas.length,
      hiatus: storedHiatus.length,
      histories: storedHistories.length
    });
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
    const readHistories = get().readHistories.filter(h => h.mangaId !== id);
    set({ mangas, hiatusRecords, readHistories });
    storage.set(mangaStorage.getKey(), mangas);
    storage.set(mangaStorage.getHiatusKey(), hiatusRecords);
    storage.set(READ_HISTORY_KEY, readHistories);
    console.log('[MangaStore] deleteManga:', id);
  },

  markAsRead: (id, type, note) => {
    const today = formatDate(new Date());
    const state = get();
    const manga = state.mangas.find(m => m.id === id);
    if (manga && type !== 'hiatus') {
      let recordChapter = manga.currentChapter;
      if (type === 'bonus') {
        recordChapter = manga.currentChapter + 1;
      }
      state.addReadHistory({
        mangaId: id,
        chapter: recordChapter,
        type,
        date: today,
        note
      });
    }
    const mangas = state.mangas.map(m => {
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
        updated.nextUpdateDate = state.getEffectiveNextUpdateDate(updated);
        return updated;
      }
      return m;
    });
    set({ mangas });
    storage.set(mangaStorage.getKey(), mangas);
    console.log('[MangaStore] markAsRead:', id, type);
  },

  addReadHistory: (history) => {
    const newHistory: ReadHistory = {
      ...history,
      id: generateId()
    };
    const readHistories = [...get().readHistories, newHistory];
    set({ readHistories });
    storage.set(READ_HISTORY_KEY, readHistories);
    console.log('[MangaStore] addReadHistory:', newHistory.id);
  },

  getReadHistoryByMangaId: (mangaId) => {
    return get().readHistories
      .filter(h => h.mangaId === mangaId)
      .sort((a, b) => b.date.localeCompare(a.date));
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

  getTodayNominalMangas: () => {
    const todayWeekday = new Date().getDay();
    const today = formatDate(new Date());
    const state = get();
    const result: { manga: Manga; status: 'normal' | 'hiatus'; resumeDate?: string }[] = [];

    state.mangas.forEach(manga => {
      if (manga.weekday !== todayWeekday) return;

      const effectiveDate = state.getEffectiveNextUpdateDate(manga);
      if (effectiveDate === today) {
        result.push({ manga, status: 'normal' });
      } else if (state.isMangaInHiatus(manga.id, today)) {
        result.push({ manga, status: 'hiatus', resumeDate: effectiveDate });
      }
    });

    return result.sort((a, b) => a.manga.updateTime.localeCompare(b.manga.updateTime));
  },

  getResumingTomorrow: () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const tomorrowStr = formatDate(tomorrow);
    const state = get();
    const result: ResumingInfo[] = [];

    state.hiatusRecords.forEach(record => {
      const endDate = addDays(addWeeks(parseDate(record.startWeekDate), record.weeksCount), -1);
      const endDateStr = formatDate(endDate);
      if (endDateStr === tomorrowStr) {
        const manga = state.mangas.find(m => m.id === record.mangaId);
        if (manga) {
          const resumeDate = formatDate(addDays(tomorrow, 0));
          result.push({
            record,
            manga,
            resumeDate,
            weeksCount: record.weeksCount
          });
        }
      }
    });

    return result;
  },

  getUpcomingHiatus: () => {
    const today = formatDate(new Date());
    const todayDate = parseDate(today);
    return get().hiatusRecords.filter(h => {
      const startDate = parseDate(h.startWeekDate);
      const endDate = addWeeks(startDate, h.weeksCount);
      return todayDate <= endDate;
    });
  },

  getExpiredHiatus: () => {
    const today = formatDate(new Date());
    const todayDate = parseDate(today);
    return get().hiatusRecords.filter(h => {
      const endDate = addDays(addWeeks(parseDate(h.startWeekDate), h.weeksCount), -1);
      return endDate < todayDate;
    });
  },

  getHiatusByStatus: (status) => {
    const all = get().hiatusRecords;
    if (status === 'all') return all;
    if (status === 'active') return get().getUpcomingHiatus();
    return get().getExpiredHiatus();
  },

  getActiveHiatusForManga: (mangaId) => {
    const today = formatDate(new Date());
    const todayDate = parseDate(today);
    return get().hiatusRecords.find(h => {
      if (h.mangaId !== mangaId) return false;
      const startDate = parseDate(h.startWeekDate);
      const endDate = addDays(addWeeks(startDate, h.weeksCount), -1);
      return todayDate >= startDate && todayDate <= endDate;
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
