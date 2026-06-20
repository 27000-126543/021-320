import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Manga, UpdateType } from '../../types/manga';
import { UPDATE_TYPE_MAP, WEEKDAY_LABELS } from '../../types/manga';
import TagBadge from '../TagBadge';
import { useMangaStore } from '../../store/useMangaStore';
import { formatDate, getWeekdayOfNextN, getDateDisplay } from '../../utils/date';

export interface TodayItemProps {
  manga: Manga;
  status?: 'normal' | 'hiatus';
  resumeDate?: string;
}

type ReadType = UpdateType;

const READ_TYPES: { type: ReadType; desc: string }[] = [
  { type: 'main', desc: '看了正篇' },
  { type: 'extra', desc: '看了番外' },
  { type: 'bonus', desc: '看了单行本加更' },
  { type: 'hiatus', desc: '确认本周休刊' }
];

const TodayItem: React.FC<TodayItemProps> = ({ manga, status = 'normal', resumeDate }) => {
  const [showActions, setShowActions] = useState(false);
  const markAsRead = useMangaStore(s => s.markAsRead);
  const addHiatus = useMangaStore(s => s.addHiatus);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);
  const getActiveHiatusForManga = useMangaStore(s => s.getActiveHiatusForManga);

  const effectiveDate = getEffectiveNextUpdateDate(manga);
  const isHiatus = status === 'hiatus' || isMangaInHiatus(manga.id, formatDate(new Date()));
  const unreadChapters = Math.max(0, manga.currentChapter - manga.lastReadChapter);
  const activeHiatus = getActiveHiatusForManga(manga.id);
  const finalResumeDate = resumeDate || effectiveDate;

  const handleMarkRead = (type: ReadType) => {
    if (type === 'hiatus') {
      const startStr = formatDate(getWeekdayOfNextN(manga.weekday, 0));
      addHiatus({
        mangaId: manga.id,
        startWeekDate: startStr,
        weeksCount: 1,
        reason: '本周临时休刊'
      });
      Taro.showToast({ title: '已记录休刊', icon: 'success' });
    } else {
      markAsRead(manga.id, type);
    }
    setShowActions(false);
  };

  const currentType: UpdateType = isHiatus ? 'hiatus' : manga.lastUpdateType;
  const today = formatDate(new Date());

  return (
    <View className={classnames(styles.todayItem, isHiatus && styles.hiatusItem)}>
      <View className={styles.itemHeader}>
        <View className={styles.leftPart}>
          <View
            className={styles.coverDot}
            style={{ backgroundColor: manga.coverColor }}
          />
          <View className={styles.nameWrap}>
            <Text className={styles.mangaName}>{manga.name}</Text>
            <Text className={styles.timeText}>原定 {manga.updateTime} 更新</Text>
          </View>
        </View>
        <View className={styles.rightPart}>
          {!isHiatus && unreadChapters > 0 && (
            <View className={styles.unreadBadge}>
              <Text>待看{unreadChapters}</Text>
            </View>
          )}
          <TagBadge type={currentType} size="md" />
        </View>
      </View>

      {isHiatus && (
        <View className={styles.hiatusNotice}>
          <View className={styles.hiatusNoticeHeader}>
            <Text className={styles.hiatusIcon}>⏸</Text>
            <Text className={styles.hiatusTitle}>本周休刊公告</Text>
          </View>
          <Text className={styles.hiatusText}>
            作者本周请假啦，不用等更新啦~
            {activeHiatus?.reason && (
              <Text className={styles.hiatusReason}> 原因：{activeHiatus.reason}</Text>
            )}
          </Text>
          <View className={styles.hiatusFooter}>
            <Text className={styles.hiatusResumeLabel}>恢复更新：</Text>
            <Text className={styles.hiatusResumeDate}>
              {getDateDisplay(finalResumeDate)}（{WEEKDAY_LABELS[manga.weekday]} {manga.updateTime}）
            </Text>
          </View>
          {activeHiatus && (
            <Text className={styles.hiatusWeeks}>
              本次休刊 {activeHiatus.weeksCount} 周
            </Text>
          )}
        </View>
      )}

      <View className={styles.itemMeta}>
        <Text className={styles.platform}>{manga.platform}</Text>
        <Text className={styles.progress}>
          当前进度：第 {manga.lastReadChapter} 话 / 共 {manga.currentChapter} 话
        </Text>
      </View>

      {!showActions ? (
        <Button
          className={classnames(styles.mainBtn, isHiatus && styles.hiatusBtn)}
          onClick={() => setShowActions(true)}
        >
          {isHiatus ? '我知道了' : '一键标记已看'}
        </Button>
      ) : (
        <View className={styles.actionSheet}>
          <Text className={styles.sheetTitle}>选择更新内容</Text>
          <View className={styles.actionList}>
            {READ_TYPES.map(item => (
              <View
                key={item.type}
                className={styles.actionOption}
                onClick={() => handleMarkRead(item.type)}
              >
                <TagBadge type={item.type} size="md" />
                <View className={styles.optionRight}>
                  <Text className={styles.optionDesc}>{item.desc}</Text>
                  <Text
                    className={styles.optionHint}
                    style={{ color: UPDATE_TYPE_MAP[item.type].color }}
                  >
                    {item.type === 'main' ? `已看到第 ${manga.currentChapter} 话` :
                      item.type === 'bonus' ? `加更话数+1` :
                      item.type === 'hiatus' ? '顺延提醒' : '记录进度'}
                  </Text>
                </View>
                <Text className={styles.optionArrow}>›</Text>
              </View>
            ))}
          </View>
          <Button
            className={styles.cancelBtn}
            onClick={() => setShowActions(false)}
          >
            取消
          </Button>
        </View>
      )}
    </View>
  );
};

export default TodayItem;
