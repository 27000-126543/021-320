import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useMangaStore } from '../../store/useMangaStore';
import { WEEKDAY_LABELS, PLATFORM_OPTIONS, COVER_COLORS, type Weekday } from '../../types/manga';
import { formatDate } from '../../utils/date';

const AddMangaPage: React.FC = () => {
  const router = useRouter();
  const editId = router.params?.id;
  const init = useMangaStore(s => s.init);
  const addManga = useMangaStore(s => s.addManga);
  const updateManga = useMangaStore(s => s.updateManga);
  const getMangaById = useMangaStore(s => s.getMangaById);

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0]);
  const [customPlatform, setCustomPlatform] = useState('');
  const [weekday, setWeekday] = useState<Weekday>(new Date().getDay() as Weekday);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [lastReadChapter, setLastReadChapter] = useState(1);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [note, setNote] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    init();
    if (editId) {
      const manga = getMangaById(editId);
      if (manga) {
        setIsEdit(true);
        Taro.setNavigationBarTitle({ title: '编辑漫画' });
        setName(manga.name);
        setPlatform(PLATFORM_OPTIONS.includes(manga.platform) ? manga.platform : '其他平台');
        setCustomPlatform(PLATFORM_OPTIONS.includes(manga.platform) ? '' : manga.platform);
        setWeekday(manga.weekday);
        const [h, m] = manga.updateTime.split(':');
        setHour(h);
        setMinute(m);
        setCurrentChapter(manga.currentChapter);
        setLastReadChapter(manga.lastReadChapter);
        setCoverColor(manga.coverColor);
        setNote(manga.note || '');
      }
    }
  }, [editId, init, getMangaById]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入作品名', icon: 'none' });
      return;
    }

    const finalPlatform = platform === '其他平台' && customPlatform.trim()
      ? customPlatform.trim()
      : platform;

    const finalHour = parseInt(hour || '0', 10) % 24;
    const finalMinute = parseInt(minute || '0', 10) % 60;
    const updateTime = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;

    if (isEdit && editId) {
      updateManga(editId, {
        name: name.trim(),
        platform: finalPlatform,
        weekday,
        updateTime,
        currentChapter: Math.max(1, currentChapter),
        lastReadChapter: Math.min(Math.max(1, lastReadChapter), Math.max(1, currentChapter)),
        coverColor,
        note: note.trim()
      });
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } else {
      addManga({
        name: name.trim(),
        platform: finalPlatform,
        weekday,
        updateTime,
        currentChapter: Math.max(1, currentChapter),
        lastReadChapter: Math.min(Math.max(1, lastReadChapter), Math.max(1, currentChapter)),
        lastUpdateType: 'main',
        coverColor,
        note: note.trim()
      });
      Taro.showToast({ title: '添加成功', icon: 'success' });
    }

    setTimeout(() => {
      Taro.navigateBack();
    }, 600);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const getWeekdayDate = (wd: number) => {
    const now = new Date();
    const currentWd = now.getDay();
    let diff = wd - currentWd;
    if (diff < 0) diff += 7;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.getDate();
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.formCard}>
        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>作品名称 *</Text>
          <Input
            className={styles.fieldInput}
            placeholder="输入漫画名称，如：咒术回战"
            value={name}
            onInput={e => setName(e.detail.value)}
            maxlength={30}
          />
        </View>

        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>封面颜色</Text>
          <View className={styles.colorSelector}>
            {COVER_COLORS.map(color => (
              <View
                key={color}
                className={classnames(
                  styles.colorOption,
                  coverColor === color && styles.selected
                )}
                style={{ backgroundColor: color }}
                onClick={() => setCoverColor(color)}
              />
            ))}
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>连载平台</Text>
          <View className={styles.platformTags}>
            {PLATFORM_OPTIONS.map(p => (
              <Text
                key={p}
                className={classnames(
                  styles.platformTag,
                  platform === p && styles.selected
                )}
                onClick={() => setPlatform(p)}
              >
                {p}
              </Text>
            ))}
          </View>
          {platform === '其他平台' && (
            <Input
              className={styles.fieldInput}
              placeholder="请输入平台名称"
              value={customPlatform}
              onInput={e => setCustomPlatform(e.detail.value)}
              maxlength={20}
              style={{ marginTop: '16rpx' }}
            />
          )}
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>连载周期（周几更新）*</Text>
          <View className={styles.weekdaySelector}>
            {[1, 2, 3, 4, 5, 6, 0].map(wd => (
              <View
                key={wd}
                className={classnames(
                  styles.weekdayOption,
                  weekday === wd && styles.selected
                )}
                onClick={() => setWeekday(wd as Weekday)}
              >
                <Text className={styles.weekdayTop}>{WEEKDAY_LABELS[wd]}</Text>
                <Text className={styles.weekdayNum}>{getWeekdayDate(wd)}</Text>
              </View>
            ))}
          </View>
          <Text className={styles.hintText}>
            选好后，日历会自动在对应星期显示此漫画
          </Text>
        </View>

        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>通常更新时间</Text>
          <View className={styles.timeSelector}>
            <View className={styles.timeColumn}>
              <Input
                className={styles.timeInput}
                type="number"
                value={hour}
                onInput={e => setHour(e.detail.value)}
                maxlength={2}
              />
              <Text className={styles.timeSep}>:</Text>
              <Input
                className={styles.timeInput}
                type="number"
                value={minute}
                onInput={e => setMinute(e.detail.value)}
                maxlength={2}
              />
            </View>
          </View>
          <Text className={styles.hintText}>
            24小时制，用于提醒你大致更新时间
          </Text>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>当前最新话数</Text>
          <View className={styles.numInputWrap}>
            <Button
              className={styles.numBtn}
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
            >-</Button>
            <View className={styles.numDisplay}>
              <Text>{currentChapter}</Text>
            </View>
            <Button
              className={styles.numBtn}
              onClick={() => setCurrentChapter(currentChapter + 1)}
            >+</Button>
          </View>
          <Text className={styles.hintText}>平台目前更新到的最新话</Text>
        </View>

        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>我已看到</Text>
          <View className={styles.numInputWrap}>
            <Button
              className={styles.numBtn}
              onClick={() => setLastReadChapter(Math.max(1, lastReadChapter - 1))}
            >-</Button>
            <View className={styles.numDisplay}>
              <Text>{lastReadChapter}</Text>
            </View>
            <Button
              className={styles.numBtn}
              onClick={() => setLastReadChapter(Math.min(currentChapter, lastReadChapter + 1))}
            >+</Button>
          </View>
          <Text className={styles.hintText}>
            已看 {lastReadChapter} / 共 {currentChapter} 话
            {currentChapter > lastReadChapter && (
              <Text style={{ color: '#F53F3F' }}>，还有 {currentChapter - lastReadChapter} 话待看</Text>
            )}
          </Text>
        </View>

        <View className={styles.fieldItem}>
          <Text className={styles.fieldLabel}>备注（选填）</Text>
          <Textarea
            className={styles.fieldTextarea}
            placeholder="记录特别的作者、画风、想看的原因..."
            value={note}
            onInput={e => setNote(e.detail.value)}
            maxlength={100}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? '保存修改' : '添加到书架'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default AddMangaPage;
