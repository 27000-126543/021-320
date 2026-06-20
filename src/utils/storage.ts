import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  MANGAS: 'manga_tracker_mangas',
  HIATUS: 'manga_tracker_hiatus',
  SETTINGS: 'manga_tracker_settings'
} as const;

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = Taro.getStorageSync(key);
      if (value === '' || value === null || value === undefined) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('[Storage] get error:', key, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(key, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] set error:', key, e);
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('[Storage] remove error:', key, e);
    }
  }
};

export const mangaStorage = {
  getKey: () => STORAGE_KEYS.MANGAS,
  getHiatusKey: () => STORAGE_KEYS.HIATUS
};
