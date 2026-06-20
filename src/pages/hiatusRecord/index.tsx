import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useMangaStore } from '../../store/useMangaStore';
import type { HiatusRecord, Manga } from '../../types/manga';
import { formatDate, addWeeks, parseDate, addDays, getDateDisplay } from '../../utils/date';

type TabType = 'active' | 'history' | 'all';

interface EnrichedHiatus extends HiatusRecord {
  manga?: Manga;
  status: 'active' | 'upcoming' | 'expired';
  endDateStr: string;
}

const HiatusRecordPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('active');

  const init = useMangaStore(s => s.init);
  const hiatusRecords = useMangaStore(s => s.hiatusRecords);
  const getMangaById = useMangaStore(s => s.getMangaById);
  const removeHiatus = useMangaStore(s => s.removeHiatus);

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const enrichedRecords: EnrichedHiatus[] = hiatusRecords.map(record => {
    const manga = getMangaById(record.mangaId);
    const startDate = parseDate(record.startWeekDate);
    const endDate = addWeeks(startDate, record.weeksCount);
    const endDateStr = formatDate(addDays(endDate, -1));
    const yesterday = addDays(today, -1);

    let status: EnrichedHiatus['status'] = 'active';
    if (today < startDate) {
      status = 'upcoming';
    } else if (endDate <= yesterday) {
      status = 'expired';
    }
    return { ...record, manga, status, endDateStr };
  }).sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, expired: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const activeCount = enrichedRecords.filter(r => r.status === 'active').length;
  const upcomingCount = enrichedRecords.filter(r => r.status === 'upcoming').length;
  const expiredCount = enrichedRecords.filter(r => r.status === 'expired').length;
  const totalWeeks = enrichedRecords.reduce((sum, r) => sum + r.weeksCount, 0);

  const displayedRecords = tab === 'all'
    ? enrichedRecords
    : enrichedRecords.filter(r => r.status === tab);

  const handleDelete = (id: string, mangaName: string) => {
    Taro.showModal({
      title: '删除记录',
      content: `确定删除「${mangaName}」的这条休刊记录吗？更新提醒会恢复到原来的时间。`,
      confirmText: '删除',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          removeHiatus(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleGoManga = (mangaId: string) => {
    Taro.navigateTo({ url: `/pages/mangaDetail/index?id=${mangaId}` });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const getStatusLabel = (status: EnrichedHiatus['status']) => {
    switch (status) {
      case 'active': return '休刊中';
      case 'upcoming': return '即将休刊';
      case 'expired': return '已过期';
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryContent}>
          <Text className={styles.summaryTitle}>📝 休刊记录总览</Text>
          <Text className={styles.summaryCount}>{activeCount}</Text>
          <Text className={styles.summaryDesc}>
            {activeCount > 0
              ? `部作品正在休刊，追更提醒会自动顺延~`
              : '当前没有休刊的作品，追更日程一切正常！'}
          </Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatNum}>{upcomingCount}</Text>
              <Text className={styles.summaryStatLabel}>即将休刊</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatNum}>{enrichedRecords.length}</Text>
              <Text className={styles.summaryStatLabel}>总记录数</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatNum}>{totalWeeks}</Text>
              <Text className={styles.summaryStatLabel}>累计休刊周</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryStatNum}>{expiredCount}</Text>
              <Text className={styles.summaryStatLabel}>已过期</Text>
            </View>
          </View>
        </View>
      </View>

      {activeCount > 0 && (
        <View className={styles.tipCard}>
          <Text className={styles.tipText}>
            💡 <Text className={styles.bold}>温馨提示：</Text>
            休刊中的作品，下次更新提醒会自动顺延到休刊结束后的{getDateDisplay(formatDate(addWeeks(today, 1)))}（下周同期）。
            记得在作者恢复更新后及时查看哦~
          </Text>
        </View>
      )}

      <View className={styles.tabs}>
        <Text
          className={classnames(styles.tab, tab === 'active' && styles.active)}
          onClick={() => setTab('active')}
        >
          休刊中 {activeCount > 0 && `(${activeCount})`}
        </Text>
        <Text
          className={classnames(styles.tab, tab === 'history' && styles.active)}
          onClick={() => setTab('history')}
        >
          历史记录
        </Text>
        <Text
          className={classnames(styles.tab, tab === 'all' && styles.active)}
          onClick={() => setTab('all')}
        >
          全部
        </Text>
      </View>

      {displayedRecords.length > 0 ? (
        displayedRecords.map(record => (
          <View
            key={record.id}
            className={classnames(
              styles.recordCard,
              record.status === 'active' && styles.active,
              record.status === 'expired' && styles.expired
            )}
            onClick={() => record.manga && handleGoManga(record.mangaId)}
          >
            <View className={styles.cardTop}>
              <View
                className={styles.mangaMini}
                style={{ backgroundColor: record.manga?.coverColor || '#86909C' }}
              >
                <Text className={styles.mangaMiniText}>
                  {record.manga?.name.slice(0, 2) || '?'}
                </Text>
              </View>
              <View className={styles.cardTopInfo}>
                <Text className={styles.mangaName}>
                  {record.manga?.name || '未知作品'}
                </Text>
                <Text className={styles.mangaPlatform}>
                  {record.manga?.platform || ''}
                </Text>
              </View>
              <Text className={classnames(styles.statusBadge, styles[record.status])}>
                {getStatusLabel(record.status)}
              </Text>
            </View>

            <View className={styles.dateRange}>
              <View className={styles.dateBlock}>
                <Text className={styles.dateLabel}>开始日</Text>
                <Text className={styles.dateValue}>{record.startWeekDate}</Text>
              </View>
              <View className={styles.dateArrow}>→</View>
              <View className={styles.dateBlock}>
                <Text className={styles.dateLabel}>结束日</Text>
                <Text className={styles.dateValue}>{record.endDateStr}</Text>
              </View>
            </View>

            <View className={styles.metaRow}>
              <View className={styles.weeksInfo}>
                <Text className={styles.weeksTag}>休刊 {record.weeksCount} 周</Text>
                {record.reason && (
                  <Text className={styles.reasonText}>「{record.reason}」</Text>
                )}
              </View>
              <View
                className={styles.delBtn}
                onClick={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  handleDelete(record.id, record.manga?.name || '该作品');
                }}
              >
                ×
              </View>
            </View>
          </View>
        ))
      ) : (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyEmoji}>🌿</Text>
          <Text className={styles.emptyTitle}>
            {tab === 'active' && '太棒啦，没有休刊中的作品'}
            {tab === 'history' && '暂无历史休刊记录'}
            {tab === 'all' && '还没有任何休刊记录'}
          </Text>
          <Text className={styles.emptyDesc}>
            {tab === 'active'
              ? '所有作品都在稳定更新中！如果看到作者发布休刊公告，记得来记录一下，下次更新会自动顺延哦~'
              : '当作者临时请假、休载、合刊或者取材时，在这里记录一下，小程序会自动帮你处理提醒日期。'}
          </Text>
          <Button className={styles.backBtn} onClick={handleBack}>
            返回书架
          </Button>
        </View>
      )}
    </View>
  );
};

export default HiatusRecordPage;
