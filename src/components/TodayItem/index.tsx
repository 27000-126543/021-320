import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Manga, UpdateType } from '../../types/manga';
import { UPDATE_TYPE_MAP } from '../../types/manga';
import TagBadge from '../TagBadge';
import { useMangaStore } from '../../store/useMangaStore';
import { formatDate, getWeekdayOfNextN } from '../../utils/date';

export interface TodayItemProps {
  manga: Manga;
}

type ReadType = UpdateType;

const READ_TYPES: { type: ReadType; desc: string }[] = [
  { type: 'main', desc: '看了正篇' },
  { type: 'extra', desc: '看了番外' },
  { type: 'bonus', desc: '看了加更' },
  { type: 'hiatus', desc: '休刊确认' }
];

const TodayItem: React.FC<TodayItemProps> = ({ manga }) => {
  const [showActions, setShowActions] = useState(false);
  const markAsRead = useMangaStore(s => s.markAsRead);
  const addHiatus = useMangaStore(s => s.addHiatus);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);

  const effectiveDate = getEffectiveNextUpdateDate(manga);
  const inHiatus = isMangaInHiatus(manga.id, effectiveDate);
  const unreadChapters = Math.max(0, manga.currentChapter - manga.lastReadChapter);

  const handleMarkRead = (type: ReadType) => {
    if (type === 'hiatus') {
      const startStr = formatDate(getWeekdayOfNextN(manga.weekday, 0));
      addHiatus({
        mangaId: manga.id,
        startWeekDate: startStr,
        weeksCount: 1,
        reason: '今天临时休刊'
      });
      Taro.showToast({ title: '已记录休刊', icon: 'success' });
    } else {
      markAsRead(manga.id, type);
    }
    setShowActions(false);
  };

  const currentType: UpdateType = inHiatus ? 'hiatus' : manga.lastUpdateType;

  return (
    <View className={styles.todayItem}>
      <View className={styles.itemHeader}>
        <View className={styles.leftPart}>
          <View
            className={styles.coverDot}
            style={{ backgroundColor: manga.coverColor }}
          />
          <View className={styles.nameWrap}>
            <Text className={styles.mangaName}>{manga.name}</Text>
            <Text className={styles.timeText}>预计 {manga.updateTime} 更新</Text>
          </View>
        </View>
        <View className={styles.rightPart}>
          {unreadChapters > 0 && (
            <View className={styles.unreadBadge}>
              <Text>待看{unreadChapters}</Text>
            </View>
          )}
          <TagBadge type={currentType} size="md" />
        </View>
      </View>

      <View className={styles.itemMeta}>
        <Text className={styles.platform}>{manga.platform}</Text>
        <Text className={styles.progress}>
          当前进度：第 {manga.lastReadChapter} 话 / 共 {manga.currentChapter} 话
        </Text>
      </View>

      {!showActions ? (
        <Button
          className={classnames(styles.mainBtn, inHiatus && styles.hiatusBtn)}
          onClick={() => setShowActions(true)}
        >
          {inHiatus ? '处理休刊' : '一键标记已看'}
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
