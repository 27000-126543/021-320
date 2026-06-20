import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { WEEKDAY_LABELS } from '../../types/manga';
import { formatDate } from '../../utils/date';

export interface WeekCalendarProps {
  selectedWeekday: number;
  onSelectWeekday: (weekday: number) => void;
  weekdayCounts: Record<number, number>;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedWeekday,
  onSelectWeekday,
  weekdayCounts
}) => {
  const today = new Date();
  const todayWeekday = today.getDay();

  const weekStart = new Date(today);
  const mondayOffset = todayWeekday === 0 ? -6 : 1 - todayWeekday;
  weekStart.setDate(today.getDate() + mondayOffset);

  const weekDays = [1, 2, 3, 4, 5, 6, 0].map((wd, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    return {
      weekday: wd as number,
      date,
      dateStr: formatDate(date),
      day: date.getDate()
    };
  });

  const todayStr = formatDate(today);

  return (
    <View className={styles.calendarWrapper}>
      <ScrollView scrollX className={styles.scrollWrap} enhanced showScrollbar={false}>
        <View className={styles.daysRow}>
          {weekDays.map(item => {
            const isSelected = item.weekday === selectedWeekday;
            const isToday = item.dateStr === todayStr;
            const count = weekdayCounts[item.weekday] || 0;

            return (
              <View
                key={item.weekday}
                className={classnames(
                  styles.dayItem,
                  isSelected && styles.selected,
                  isToday && !isSelected && styles.today
                )}
                onClick={() => onSelectWeekday(item.weekday)}
              >
                <Text className={classnames(
                  styles.weekdayLabel,
                  (isSelected || isToday) && styles.labelActive
                )}>
                  {WEEKDAY_LABELS[item.weekday]}
                </Text>
                <Text className={classnames(
                  styles.dayNum,
                  isSelected && styles.dayNumActive,
                  isToday && !isSelected && styles.dayNumToday
                )}>
                  {item.day}
                </Text>
                <View className={classnames(
                  styles.countBadge,
                  count > 0 && styles.hasCount,
                  isSelected && styles.countBadgeActive,
                  isToday && !isSelected && styles.countBadgeToday
                )}>
                  <Text>{count > 0 ? count : '—'}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default WeekCalendar;
