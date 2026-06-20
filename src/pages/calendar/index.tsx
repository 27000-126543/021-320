import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import WeekCalendar from '../../components/WeekCalendar';
import MangaCard from '../../components/MangaCard';
import { WEEKDAY_LABELS } from '../../types/manga';
import { useMangaStore } from '../../store/useMangaStore';
import { formatDate, getDateDisplay } from '../../utils/date';

const CalendarPage: React.FC = () => {
  const [selectedWeekday, setSelectedWeekday] = useState<number>(new Date().getDay());
  const init = useMangaStore(s => s.init);
  const mangas = useMangaStore(s => s.mangas);
  const getMangasByWeekday = useMangaStore(s => s.getMangasByWeekday);
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const weekdayCounts: Record<number, number> = {};
  [0, 1, 2, 3, 4, 5, 6].forEach(wd => {
    weekdayCounts[wd] = getMangasByWeekday(wd).length;
  });

  const selectedMangas = getMangasByWeekday(selectedWeekday);
  const sortedMangas = [...selectedMangas].sort((a, b) =>
    a.updateTime.localeCompare(b.updateTime)
  );

  const todayMangasCount = mangas.filter(m => {
    const effDate = getEffectiveNextUpdateDate(m);
    return effDate === formatDate(new Date()) && !isMangaInHiatus(m.id, effDate);
  }).length;

  const totalUnread = mangas.reduce((sum, m) =>
    sum + Math.max(0, m.currentChapter - m.lastReadChapter), 0
  );

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/addManga/index' });
  };

  const today = formatDate(new Date());
  const selectedDateLabel = (() => {
    const now = new Date();
    const currentWd = now.getDay();
    let diff = selectedWeekday - currentWd;
    if (diff < 0) diff += 7;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    const dateStr = formatDate(target);
    return getDateDisplay(dateStr);
  })();

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <View className={styles.headerTop}>
            <Text className={styles.appTitle}>📖 追更日历</Text>
            <Button className={styles.addBtn} onClick={handleAdd}>+</Button>
          </View>

          <View className={styles.statsRow}>
            <View className={styles.statCard}>
              <Text className={styles.statNum}>{mangas.length}</Text>
              <Text className={styles.statLabel}>在追作品</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statNum}>{todayMangasCount}</Text>
              <Text className={styles.statLabel}>今日更新</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statNum}>{totalUnread}</Text>
              <Text className={styles.statLabel}>待看话数</Text>
            </View>
          </View>

          {todayMangasCount > 0 && (
            <View className={styles.todayTip}>
              <Text>🔥 今天有 {todayMangasCount} 部作品更新，记得去看哦~</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.contentArea}>
        <WeekCalendar
          selectedWeekday={selectedWeekday}
          onSelectWeekday={setSelectedWeekday}
          weekdayCounts={weekdayCounts}
        />

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>{WEEKDAY_LABELS[selectedWeekday]}更新</Text>
          <Text className={styles.weekdayLabel}>{selectedDateLabel}</Text>
        </View>

        {sortedMangas.length > 0 ? (
          <View className={styles.mangaList}>
            {sortedMangas.map(manga => (
              <MangaCard key={manga.id} manga={manga} showUpdateDate={false} />
            ))}
          </View>
        ) : (
          <View className={styles.emptyHint}>
            <Text className={styles.emptyText}>🌙 {WEEKDAY_LABELS[selectedWeekday]}暂无追更</Text>
            <Text className={styles.emptySub}>点击右下角「+」添加漫画</Text>
          </View>
        )}
      </View>

      <Button className={styles.fabBtn} onClick={handleAdd}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default CalendarPage;
