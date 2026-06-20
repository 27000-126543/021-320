import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import TodayItem from '../../components/TodayItem';
import { useMangaStore } from '../../store/useMangaStore';
import { formatDate } from '../../utils/date';
import { WEEKDAY_LABELS, UPDATE_TYPE_MAP } from '../../types/manga';

const TodayPage: React.FC = () => {
  const init = useMangaStore(s => s.init);
  const mangas = useMangaStore(s => s.mangas);
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);
  const getTodayMangas = useMangaStore(s => s.getTodayMangas);

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const todayStr = formatDate(new Date());
  const todayMangas = getTodayMangas().sort((a, b) => a.updateTime.localeCompare(b.updateTime));

  const inHiatusCount = todayMangas.filter(m => isMangaInHiatus(m.id, todayStr)).length;
  const normalCount = todayMangas.length - inHiatusCount;

  const totalUnread = mangas.reduce((sum, m) =>
    sum + Math.max(0, m.currentChapter - m.lastReadChapter), 0
  );

  const handleGoAdd = () => {
    Taro.navigateTo({ url: '/pages/addManga/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.heroCard}>
        <View className={styles.heroTop}>
          <Text className={styles.dateText}>{todayStr}</Text>
          <Text className={styles.weekdayBadge}>{WEEKDAY_LABELS[new Date().getDay()]}</Text>
        </View>
        <View className={styles.heroMain}>
          <Text className={styles.heroCount}>{todayMangas.length}</Text>
          <Text className={styles.heroLabel}>部作品今天有更新</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{normalCount}</Text>
            <Text className={styles.statName}>正常更新</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{inHiatusCount}</Text>
            <Text className={styles.statName}>休刊中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalUnread}</Text>
            <Text className={styles.statName}>累计待看</Text>
          </View>
        </View>
      </View>

      <View className={styles.typeLegend}>
        {Object.entries(UPDATE_TYPE_MAP).map(([type, cfg]) => (
          <View key={type} className={styles.legendItem}>
            <View
              className={styles.legendDot}
              style={{ backgroundColor: cfg.color }}
            />
            <Text className={styles.legendText}>{cfg.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>今日列表</Text>
      </View>

      {todayMangas.length > 0 ? (
        <View className={styles.todayList}>
          {todayMangas.map(manga => (
            <TodayItem key={manga.id} manga={manga} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyEmoji}>🎮</Text>
          <Text className={styles.emptyTitle}>今天没有漫画更新</Text>
          <Text className={styles.emptyDesc}>
            太棒啦！今天的漫画都看完了，或者{'\n'}
            今天正好没有追的作品更新~{'\n'}
            可以去日历里加追更多好作品！
          </Text>
          <Button className={styles.goAddBtn} onClick={handleGoAdd}>
            添加追更多漫画
          </Button>
        </View>
      )}
    </View>
  );
};

export default TodayPage;
