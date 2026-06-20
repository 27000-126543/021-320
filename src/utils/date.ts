export const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const padZero = (num: number): string => num.toString().padStart(2, '0');

export const getWeekday = (date: Date): number => date.getDay();

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const getWeekdayOfNextN = (weekday: number, n: number = 0): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekday = today.getDay();
  let diff = weekday - currentWeekday;
  if (diff < 0) diff += 7;
  diff += n * 7;
  return addDays(today, diff);
};

export const isToday = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseDate(dateStr);
  target.setHours(0, 0, 0, 0);
  return today.getTime() === target.getTime();
};

export const getDateDisplay = (dateStr: string): string => {
  const target = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return '今天';
  if (target.getTime() === tomorrow.getTime()) return '明天';
  if (target.getTime() === yesterday.getTime()) return '昨天';

  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays}天后`;
  }
  if (diffDays < 0 && diffDays > -7) {
    return `${Math.abs(diffDays)}天前`;
  }
  return `${target.getMonth() + 1}/${target.getDate()}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getWeekStartEnd = (baseDate: Date = new Date()): { start: Date; end: Date; dates: Date[] } => {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const currentWeekday = today.getDay();
  const mondayOffset = currentWeekday === 0 ? -6 : 1 - currentWeekday;
  const start = addDays(today, mondayOffset);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i));
  }
  const end = addDays(start, 6);
  return { start, end, dates };
};
