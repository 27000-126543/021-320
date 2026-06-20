import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { ResumingInfo } from '../../store/useMangaStore';
import { WEEKDAY_LABELS } from '../../types/manga';

export interface ResumingAlertProps {
  resumingList: ResumingInfo[];
}

const ResumingAlert: React.FC<ResumingAlertProps> = ({ resumingList }) => {
  if (resumingList.length === 0) return null;

  const handleClick = (mangaId: string) => {
    Taro.navigateTo({
      url: `/pages/mangaDetail/index?id=${mangaId}`
    });
  };

  return (
    <View className={styles.alertContainer}>
      <View className={styles.alertHeader}>
        <View className={styles.alertIcon}>
          <Text>🔔</Text>
        </View>
        <View className={styles.alertHeaderText}>
          <Text className={styles.alertTitle}>休刊恢复提醒</Text>
          <Text className={styles.alertSubtitle}>
            明天有 {resumingList.length} 部作品结束休刊，记得来看~
          </Text>
        </View>
      </View>

      <View className={styles.resumingList}>
        {resumingList.map(item => (
          <View
            key={item.record.id}
            className={styles.resumingItem}
            onClick={() => handleClick(item.manga.id)}
          >
            <View
              className={styles.mangaCover}
              style={{ backgroundColor: item.manga.coverColor }}
            >
              <Text className={styles.coverText}>
                {item.manga.name.length > 2 ? item.manga.name.slice(0, 2) : item.manga.name}
              </Text>
            </View>
            <View className={styles.itemContent}>
              <View className={styles.itemTop}>
                <Text className={styles.mangaName}>{item.manga.name}</Text>
                <View className={styles.weekBadge}>
                  <Text>休刊 {item.weeksCount} 周</Text>
                </View>
              </View>
              <View className={styles.itemBottom}>
                <Text className={styles.platform}>📍 {item.manga.platform}</Text>
                <Text className={styles.resumeInfo}>
                  明天（{WEEKDAY_LABELS[item.manga.weekday]}）{item.manga.updateTime} 恢复更新
                </Text>
              </View>
            </View>
            <Text className={styles.arrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ResumingAlert;
