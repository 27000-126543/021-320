import type { Manga, HiatusRecord, Weekday, UpdateType } from '../types/manga';
import { formatDate, addWeeks } from '../utils/date';

export const mockMangas: Manga[] = [
  {
    id: 'manga-1',
    name: '异世界生活',
    platform: '哔哩哔哩漫画',
    weekday: 1 as Weekday,
    updateTime: '12:00',
    currentChapter: 128,
    lastReadChapter: 127,
    lastReadDate: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
    coverColor: '#7B61FF'
  },
  {
    id: 'manga-2',
    name: '樱花庄的日常',
    platform: '快看漫画',
    weekday: 2 as Weekday,
    updateTime: '18:00',
    currentChapter: 56,
    lastReadChapter: 55,
    lastReadDate: formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)),
    coverColor: '#FF6B9D'
  },
  {
    id: 'manga-3',
    name: '机械纪元',
    platform: '腾讯动漫',
    weekday: 3 as Weekday,
    updateTime: '10:00',
    currentChapter: 89,
    lastReadChapter: 87,
    lastReadDate: formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'bonus' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)),
    coverColor: '#22D3EE'
  },
  {
    id: 'manga-4',
    name: '山海奇谈录',
    platform: '哔哩哔哩漫画',
    weekday: 4 as Weekday,
    updateTime: '20:00',
    currentChapter: 203,
    lastReadChapter: 200,
    lastReadDate: formatDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 200 * 24 * 60 * 60 * 1000)),
    coverColor: '#34D399'
  },
  {
    id: 'manga-5',
    name: '星尘学院',
    platform: '咚漫',
    weekday: 5 as Weekday,
    updateTime: '16:00',
    currentChapter: 42,
    lastReadChapter: 42,
    lastReadDate: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'extra' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    coverColor: '#FBBF24'
  },
  {
    id: 'manga-6',
    name: '剑与魔法的日常',
    platform: '哔哩哔哩漫画',
    weekday: 6 as Weekday,
    updateTime: '09:00',
    currentChapter: 77,
    lastReadChapter: 75,
    lastReadDate: formatDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)),
    coverColor: '#FB923C'
  },
  {
    id: 'manga-7',
    name: '末世求生录',
    platform: '快看漫画',
    weekday: 0 as Weekday,
    updateTime: '12:00',
    currentChapter: 156,
    lastReadChapter: 154,
    lastReadDate: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 150 * 24 * 60 * 60 * 1000)),
    coverColor: '#A78BFA'
  },
  {
    id: 'manga-8',
    name: '侦探少年',
    platform: '腾讯动漫',
    weekday: 1 as Weekday,
    updateTime: '21:00',
    currentChapter: 312,
    lastReadChapter: 310,
    lastReadDate: formatDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 300 * 24 * 60 * 60 * 1000)),
    coverColor: '#F87171'
  },
  {
    id: 'manga-9',
    name: '美食大冒险',
    platform: '哔哩哔哩漫画',
    weekday: 3 as Weekday,
    updateTime: '14:00',
    currentChapter: 68,
    lastReadChapter: 67,
    lastReadDate: formatDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 70 * 24 * 60 * 60 * 1000)),
    coverColor: '#7B61FF'
  },
  {
    id: 'manga-10',
    name: '音乐少女',
    platform: '快看漫画',
    weekday: 5 as Weekday,
    updateTime: '19:00',
    currentChapter: 24,
    lastReadChapter: 22,
    lastReadDate: formatDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
    lastUpdateType: 'main' as UpdateType,
    createdAt: formatDate(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)),
    coverColor: '#FF6B9D'
  }
];

export const mockHiatusRecords: HiatusRecord[] = [
  {
    id: 'hiatus-1',
    mangaId: 'manga-3',
    startWeekDate: formatDate(new Date()),
    weeksCount: 1,
    reason: '作者外出取材，下周恢复',
    createdAt: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
  }
];
