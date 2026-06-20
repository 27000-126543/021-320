export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type UpdateType = 'main' | 'extra' | 'hiatus' | 'bonus';

export type UpdateTypeLabel = '正篇' | '番外' | '休刊' | '加更';

export interface HiatusRecord {
  id: string;
  mangaId: string;
  startWeekDate: string;
  weeksCount: number;
  reason?: string;
  createdAt: string;
}

export interface ReadHistory {
  id: string;
  mangaId: string;
  chapter: number;
  type: UpdateType;
  date: string;
  note?: string;
}

export interface Manga {
  id: string;
  name: string;
  platform: string;
  weekday: Weekday;
  updateTime: string;
  currentChapter: number;
  lastReadChapter: number;
  lastReadDate?: string;
  lastUpdateType: UpdateType;
  nextUpdateDate?: string;
  createdAt: string;
  coverColor: string;
  note?: string;
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日'
};

export const UPDATE_TYPE_MAP: Record<UpdateType, { label: string; color: string }> = {
  main: { label: '正篇', color: '#7B61FF' },
  extra: { label: '番外', color: '#FF6B9D' },
  hiatus: { label: '休刊', color: '#86909C' },
  bonus: { label: '加更', color: '#22D3EE' }
};

export const PLATFORM_OPTIONS = [
  '哔哩哔哩漫画',
  '快看漫画',
  '腾讯动漫',
  '咚漫',
  '漫画人',
  '其他平台'
];

export const COVER_COLORS = [
  '#7B61FF',
  '#FF6B9D',
  '#22D3EE',
  '#34D399',
  '#FBBF24',
  '#FB923C',
  '#A78BFA',
  '#F87171'
];
