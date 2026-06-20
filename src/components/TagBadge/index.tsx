import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { UPDATE_TYPE_MAP } from '../../types/manga';

export interface TagBadgeProps {
  type: keyof typeof UPDATE_TYPE_MAP;
  size?: 'sm' | 'md';
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ type, size = 'sm', className }) => {
  const config = UPDATE_TYPE_MAP[type];

  return (
    <View
      className={classnames(styles.tagBadge, styles[size], className)}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: `${config.color}30`
      }}
    >
      <Text>{config.label}</Text>
    </View>
  );
};

export default TagBadge;
