import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Manga } from '../../types/manga';
import TagBadge from '../TagBadge';
import { useMangaStore } from '../../store/useMangaStore';
import { getDateDisplay } from '../../utils/date';

export interface MangaCardProps {
  manga: Manga;
  variant?: 'default' | 'compact';
  showUpdateDate?: boolean;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, variant = 'default', showUpdateDate = true }) => {
  const isCompact = variant === 'compact';
  const getEffectiveNextUpdateDate = useMangaStore(s => s.getEffectiveNextUpdateDate);
  const isMangaInHiatus = useMangaStore(s => s.isMangaInHiatus);
  const effectiveDate = getEffectiveNextUpdateDate(manga);
  const inHiatusToday = isMangaInHiatus(manga.id, effectiveDate);

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/mangaDetail/index?id=${manga.id}`
    });
  };

  const unreadChapters = Math.max(0, manga.currentChapter - manga.lastReadChapter);

  return (
    <View
      className={classnames(styles.mangaCard, isCompact && styles.compact)}
      onClick={handleClick}
    >
      <View
        className={styles.coverBox}
        style={{ backgroundColor: manga.coverColor }}
      >
        <Text className={styles.coverText}>
          {manga.name.length > 2 ? manga.name.slice(0, 2) : manga.name}
        </Text>
      </View>

      <View className={styles.contentBox}>
        <View className={styles.headerRow}>
          <Text className={styles.mangaName}>{manga.name}</Text>
          {unreadChapters > 0 && (
            <View className={styles.unreadBadge}>
              <Text>{unreadChapters}</Text>
            </View>
          )}
        </View>

        <View className={styles.metaRow}>
          <Text className={styles.platform}>{manga.platform}</Text>
          <View className={styles.chapterInfo}>
            <Text className={styles.chapterText}>
              已看 {manga.lastReadChapter} / {manga.currentChapter} 话
            </Text>
          </View>
        </View>

        {!isCompact && (
          <View className={styles.bottomRow}>
            <TagBadge type={inHiatusToday ? 'hiatus' : manga.lastUpdateType} />
            {showUpdateDate && effectiveDate && (
              <Text className={styles.updateDate}>
                {inHiatusToday ? '休刊中' : `下次更新：${getDateDisplay(effectiveDate)}`}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default MangaCard;
