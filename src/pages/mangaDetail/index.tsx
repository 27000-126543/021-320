import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useMangaStore } from '../../store/useMangaStore';
import TagBadge from '../../components/TagBadge';
import { WEEKDAY_LABELS, type UpdateType } from '../../types/manga';
import {
  formatDate,
  getDateDisplay,
  getWeekdayOfNextN,
  addWeeks
} from '../../utils/date';

const MangaDetailPage: React.FC = () => {
  const router = useRouter();
  const mangaId = router.params?.id || '';

  const init = useMangaStore(s => s.init);
  const getMangaById = useMangaStore(s => s.getMangaById);
  const deleteManga = useMangaStore(s => s.deleteManga);
  const addHiatus = useMangaStore(s => s.addHiatus);
  const removeHiatus = useMangaStore(s => s.removeHiatus);
  const markAsRead = useMangaStore(s => s.markAsRead);
  const hiatusRecords = useMangaStore(s => s.hiatusRecords);
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);

  const [showHiatusModal, setShowHiatusModal] = useState(false);
  const [hiatusWeeks, setHiatusWeeks] = useState(1);
  const [hiatusReason, setHiatusReason] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  useDidShow(() => {
    init();
  });

  const manga = getMangaById(mangaId);

  if (!manga) {
    return (
      <View className={styles.page} style={{ padding: 64, textAlign: 'center' }}>
        <Text style={{ fontSize: 28, color: '#86909C' }}>作品不存在或已删除</Text>
      </View>
    );
  }

  const effectiveDate = getEffectiveNextUpdateDate(manga);
  const inHiatus = isMangaInHiatus(mangaId, effectiveDate);
  const mangaHiatus = hiatusRecords.filter(h => h.mangaId === mangaId);
  const progressPct = manga.currentChapter > 0
    ? Math.min(100, Math.round((manga.lastReadChapter / manga.currentChapter) * 100))
    : 0;
  const unreadCount = Math.max(0, manga.currentChapter - manga.lastReadChapter);

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/addManga/index?id=${mangaId}` });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要从书架移除「${manga.name}」吗？相关休刊记录也会被清除。`,
      confirmText: '删除',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          deleteManga(mangaId);
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 600);
        }
      }
    });
  };

  const handleMarkRead = () => {
    markAsRead(mangaId, manga.lastUpdateType as UpdateType);
    Taro.showToast({ title: '已标记', icon: 'success' });
  };

  const handleAddHiatus = () => {
    setHiatusWeeks(1);
    setHiatusReason('');
    setShowHiatusModal(true);
  };

  const handleConfirmHiatus = () => {
    const startDate = getWeekdayOfNextN(manga.weekday, 0);
    const startStr = formatDate(startDate);
    addHiatus({
      mangaId,
      startWeekDate: startStr,
      weeksCount: hiatusWeeks,
      reason: hiatusReason.trim()
    });
    setShowHiatusModal(false);
    Taro.showToast({ title: '已记录休刊', icon: 'success' });
  };

  const handleDeleteHiatus = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条休刊记录吗？更新提醒会恢复到原来的时间。',
      confirmText: '删除',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          removeHiatus(id);
        }
      }
    });
  };

  const handleGoPlatform = () => {
    Taro.setClipboardData({
      data: manga.platform,
      success: () => {
        Taro.showToast({ title: `已复制「${manga.platform}」`, icon: 'none' });
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroSection}>
        <View className={styles.mangaInfoCard}>
          <View className={styles.infoTop}>
            <View
              className={styles.bigCover}
              style={{ backgroundColor: manga.coverColor }}
            >
              <Text className={styles.coverContent}>
                {manga.name.length > 3 ? manga.name.slice(0, 3) : manga.name}
              </Text>
            </View>
            <View className={styles.infoRight}>
              <Text className={styles.mangaTitle}>{manga.name}</Text>
              <Text className={styles.mangaPlatform} onClick={handleGoPlatform}>
                📍 {manga.platform}
              </Text>
              <View style={{ display: 'flex', gap: 12 }}>
                <TagBadge type={inHiatus ? 'hiatus' : manga.lastUpdateType} size="md" />
              </View>
            </View>
          </View>

          <View className={styles.quickStats}>
            <View className={styles.quickStat}>
              <Text className={styles.quickStatNum}>{manga.currentChapter}</Text>
              <Text className={styles.quickStatLabel}>最新话</Text>
            </View>
            <View className={styles.quickStat}>
              <Text className={styles.quickStatNum}>{manga.lastReadChapter}</Text>
              <Text className={styles.quickStatLabel}>已看到</Text>
            </View>
            <View className={styles.quickStat}>
              <Text className={styles.quickStatNum} style={{ color: unreadCount > 0 ? '#F53F3F' : '#00B42A' }}>
                {unreadCount}
              </Text>
              <Text className={styles.quickStatLabel}>待看话</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>连载周期</Text>
            <Text className={classnames(styles.infoValue, styles.highlightValue)}>
              每{WEEKDAY_LABELS[manga.weekday]} {manga.updateTime}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下次更新</Text>
            <Text className={styles.infoValue}>
              {inHiatus
                ? <Text style={{ color: '#FF7D00' }}>⏸ 休刊中（{getDateDisplay(effectiveDate)}恢复）</Text>
                : <Text className={styles.highlightValue}>{getDateDisplay(effectiveDate)}（{WEEKDAY_LABELS[manga.weekday]}）</Text>
              }
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>追更开始</Text>
            <Text className={styles.infoValue}>{manga.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>阅读进度</Text>
        <View className={styles.chartBar}>
          <View className={styles.chartFill} style={{ width: `${progressPct}%` }} />
        </View>
        <View className={styles.chartLabels}>
          <Text>第 1 话</Text>
          <Text style={{ color: '#7B61FF', fontWeight: 600 }}>
            已看 {manga.lastReadChapter} / {manga.currentChapter} 话（{progressPct}%）
          </Text>
          <Text>第 {manga.currentChapter} 话</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>休刊记录</Text>
        {inHiatus && (
          <View className={styles.hiatusHintCard}>
            <Text className={styles.hiatusHintText}>
              ⚠️  当前处于休刊状态，提醒已自动顺延。下次更新会在 {getDateDisplay(effectiveDate)} 恢复。
            </Text>
          </View>
        )}
        {mangaHiatus.length > 0 ? (
          <View className={styles.hiatusList}>
            {mangaHiatus.map(record => {
              const endDate = formatDate(addWeeks(getWeekdayOfNextN(manga.weekday, record.weeksCount), 0));
              return (
                <View key={record.id} className={styles.hiatusItem}>
                  <View className={styles.hiatusIcon}>📝</View>
                  <View className={styles.hiatusInfo}>
                    <Text className={styles.hiatusText}>
                      休刊 {record.weeksCount} 周
                    </Text>
                    <Text className={styles.hiatusSub}>
                      {record.startWeekDate} ~ {endDate}
                      {record.reason ? ` · ${record.reason}` : ''}
                    </Text>
                  </View>
                  <View className={styles.hiatusDel} onClick={() => handleDeleteHiatus(record.id)}>
                    ×
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text className={styles.noHiatus}>暂无休刊记录</Text>
        )}
      </View>

      {manga.note && (
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>备注</Text>
          <Text className={styles.noteBox}>📝 {manga.note}</Text>
        </View>
      )}

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.secondaryBtn, styles.danger)} onClick={handleDelete}>
          删除
        </Button>
        <Button className={styles.secondaryBtn} onClick={handleEdit}>
          编辑
        </Button>
        {unreadCount > 0 ? (
          <Button className={styles.primaryBtn} onClick={handleMarkRead}>
            标记已看
          </Button>
        ) : (
          <Button className={classnames(styles.primaryBtn, styles.warn)} onClick={handleAddHiatus}>
            记录休刊
          </Button>
        )}
      </View>

      {showHiatusModal && (
        <View className={styles.modalOverlay} onClick={() => setShowHiatusModal(false)}>
          <View className={styles.modalCard} onClick={e => e.stopPropagation && e.stopPropagation()}>
            <Text className={styles.modalTitle}>记录休刊</Text>

            <View className={styles.modalField}>
              <Text className={styles.modalLabel}>休刊周数</Text>
              <View className={styles.weekSelector}>
                {[1, 2, 3, 4, 8].map(w => (
                  <Text
                    key={w}
                    className={classnames(styles.weekOption, hiatusWeeks === w && styles.selected)}
                    onClick={() => setHiatusWeeks(w)}
                  >
                    {w}周
                  </Text>
                ))}
              </View>
            </View>

            <View className={styles.modalField}>
              <Text className={styles.modalLabel}>休刊原因（选填）</Text>
              <Input
                className={styles.modalInput}
                placeholder="如：作者取材、合刊、春节休载等"
                value={hiatusReason}
                onInput={e => setHiatusReason(e.detail.value)}
                maxlength={30}
              />
            </View>

            <View style={{ padding: 16, background: '#FFF7ED', borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 24, color: '#FF7D00' }}>
                📅 下次更新提醒将顺延至 {getDateDisplay(
                  formatDate(getWeekdayOfNextN(manga.weekday, hiatusWeeks))
                )}
              </Text>
            </View>

            <View className={styles.modalBtns}>
              <Button className={styles.modalCancel} onClick={() => setShowHiatusModal(false)}>
                取消
              </Button>
              <Button className={styles.modalConfirm} onClick={handleConfirmHiatus}>
                确认记录
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default MangaDetailPage;
