import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionText, onAction }) => {
  return (
    <View className={styles.emptyWrapper}>
      <View className={styles.emptyIcon}>
        <Text className={styles.iconEmoji}>📚</Text>
      </View>
      <Text className={styles.emptyTitle}>{title}</Text>
      {description && <Text className={styles.emptyDesc}>{description}</Text>}
      {actionText && onAction && (
        <Button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
