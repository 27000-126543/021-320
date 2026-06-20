import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import MangaCard from '../../components/MangaCard';
import { useMangaStore } from '../../store/useMangaStore';
import { WEEKDAY_LABELS } from '../../types/manga';

type FilterType = 'all' | 'unread' | 'weekday';

const MENU_ITEMS = [
  {
    icon: '➕',
    title: '添加漫画',
    desc: '添加你正在追的漫画作品',
    iconBg: 'rgba(123, 97, 255, 0.1)',
    path: '/pages/addManga/index'
  },
  {
    icon: '📝',
    title: '休刊记录',
    desc: '管理临时休刊和恢复提醒',
    iconBg: 'rgba(255, 107, 157, 0.1)',
    path: '/pages/hiatusRecord/index',
    badge: null as number | null
  },
  {
    icon: '📊',
    title: '阅读统计',
    desc: '查看阅读数据和趋势',
    iconBg: 'rgba(34, 211, 238, 0.1)',
    path: null
  },
  {
    icon: '⚙️',
    title: '偏好设置',
    desc: '更新提醒、显示设置等',
    iconBg: 'rgba(134, 144, 156, 0.1)',
    path: null
  }
];

const MinePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [filterWeekday, setFilterWeekday] = useState<number | null>(null);

  const init = useMangaStore(s => s.init);
  const mangas = useMangaStore(s => s.mangas);
  const hiatusRecords = useMangaStore(s => s.hiatusRecords);
  const getUpcomingHiatus = useMangaStore(s => s.getUpcomingHiatus);

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const totalUnread = mangas.reduce((sum, m) =>
    sum + Math.max(0, m.currentChapter - m.lastReadChapter), 0
  );

  const unreadMangaCount = mangas.filter(m => m.currentChapter > m.lastReadChapter).length;
  const upcomingHiatusCount = getUpcomingHiatus().length;

  let displayedMangas = [...mangas];
  if (filter === 'unread') {
    displayedMangas = displayedMangas.filter(m => m.currentChapter > m.lastReadChapter);
  } else if (filter === 'weekday' && filterWeekday !== null) {
    displayedMangas = displayedMangas.filter(m => m.weekday === filterWeekday);
  }

  displayedMangas.sort((a, b) => a.name.localeCompare(b.name));

  const handleMenuClick = (item: typeof MENU_ITEMS[0]) => {
    if (item.path) {
      Taro.navigateTo({ url: item.path });
    } else {
      Taro.showToast({
        title: '功能开发中~',
        icon: 'none'
      });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileHeader}>
        <View className={styles.profileContent}>
          <View className={styles.profileRow}>
            <View className={styles.avatar}>
              <Text className={styles.avatarEmoji}>🎨</Text>
            </View>
            <View className={styles.userInfo}>
              <Text className={styles.userName}>漫画追更小能手</Text>
              <Text className={styles.userMotto}>追更不迷路，看漫超快乐~</Text>
            </View>
          </View>

          <View className={styles.statsGrid}>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{mangas.length}</Text>
              <Text className={styles.statsLabel}>在追作品</Text>
            </View>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{unreadMangaCount}</Text>
              <Text className={styles.statsLabel}>有未读</Text>
            </View>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{totalUnread}</Text>
              <Text className={styles.statsLabel}>待看话数</Text>
            </View>
            <View className={styles.statsCell}>
              <Text className={styles.statsNum}>{hiatusRecords.length}</Text>
              <Text className={styles.statsLabel}>休刊记录</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.menuArea}>
        <View className={styles.menuCard}>
          {MENU_ITEMS.map((item, idx) => (
            <View
              key={idx}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item)}
            >
              <View
                className={styles.menuIcon}
                style={{ backgroundColor: item.iconBg }}
              >
                <Text>{item.icon}</Text>
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
              {item.title === '休刊记录' && upcomingHiatusCount > 0 && (
                <Text className={styles.menuBadge}>{upcomingHiatusCount}</Text>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.mangaArea}>
        <View className={styles.sectionTitleRow}>
          <Text className={styles.sectionTitle}>全部作品</Text>
          <Text className={styles.countBadge}>{displayedMangas.length} 部</Text>
        </View>

        <View className={styles.filterTabs}>
          <Text
            className={classnames(styles.filterTab, filter === 'all' && styles.active)}
            onClick={() => setFilter('all')}
          >
            全部
          </Text>
          <Text
            className={classnames(styles.filterTab, filter === 'unread' && styles.active)}
            onClick={() => setFilter('unread')}
          >
            未读
          </Text>
          <Text
            className={classnames(styles.filterTab, filter === 'weekday' && styles.active)}
            onClick={() => {
              setFilter('weekday');
              if (filterWeekday === null) setFilterWeekday(new Date().getDay());
            }}
          >
            按星期
          </Text>
        </View>

        {filter === 'weekday' && (
          <View className={styles.filterTabs}>
            {[1, 2, 3, 4, 5, 6, 0].map(wd => (
              <Text
                key={wd}
                className={classnames(
                  styles.filterTab,
                  filterWeekday === wd && styles.active
                )}
                onClick={() => setFilterWeekday(wd)}
              >
                {WEEKDAY_LABELS[wd]}
              </Text>
            ))}
          </View>
        )}

        {displayedMangas.map(manga => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </View>
    </View>
  );
};

export default MinePage;
