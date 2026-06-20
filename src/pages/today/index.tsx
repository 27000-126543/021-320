import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import TodayItem from '../../components/TodayItem';
import ResumingAlert from '../../components/ResumingAlert';
import { useMangaStore } from '../../store/useMangaStore';
import { formatDate } from '../../utils/date';
import { WEEKDAY_LABELS, UPDATE_TYPE_MAP } from '../../types/manga';

const TodayPage: React.FC = () => {
  const init = useMangaStore(s => s.init);
  const mangas = useMangaStore(s => s.mangas);
  const getTodayNominalMangas = useMangaStore(s => s.getTodayNominalMangas);
  const getResumingTomorrow = useMangaStore(s => s.getResumingTomorrow);

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const todayStr = formatDate(new Date());
  const todayList = getTodayNominalMangas();
  const resumingTomorrow = getResumingTomorrow();

  const inHiatusCount = todayList.filter(t => t.status === 'hiatus').length;
  const normalCount = todayList.filter(t => t.status === 'normal').length;

  const totalUnread = mangas.reduce((sum, m) =>
    sum + Math.max(0, m.currentChapter - m.lastReadChapter), 0
  );

  const handleGoAdd = () => {
    Taro.navigateTo({ url: '/pages/addManga/index' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroCard}>
        <View className={styles.heroTop}>
          <Text className={styles.dateText}>{todayStr}</Text>
          <Text className={styles.weekdayBadge}>{WEEKDAY_LABELS[new Date().getDay()]}</Text>
        </View>
        <View className={styles.heroMain}>
          <Text className={styles.heroCount}>{todayList.length}</Text>
          <Text className={styles.heroLabel}>部作品原定今日更新</Text>
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

      {resumingTomorrow.length > 0 && (
        <ResumingAlert resumingList={resumingTomorrow} />
      )}

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

      {todayList.length > 0 ? (
        <View className={styles.todayList}>
          {todayList.map(item => (
            <TodayItem
              key={item.manga.id}
              manga={item.manga}
              status={item.status}
              resumeDate={item.resumeDate}
            />
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
