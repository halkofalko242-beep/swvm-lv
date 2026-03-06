// ─── NowPlayingScreen ──────────────────────────────────────────────
import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  PanResponder, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from 'react-native-track-player';
import { useStore } from '../store/useStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { THEMES } from '../constants/themes';
import { LANG, t } from '../constants/i18n';
import { fmtTime } from '../utils/format';

const { width: SCREEN_W } = Dimensions.get('window');

export function NowPlayingScreen({ navigation }) {
  const { songs, currentIndex, isPlaying, settings, toggleFavorite } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';
  const { play, togglePlay, next, prev, seek, toggleShuffle, cycleRepeat } = useAudioPlayer();

  const { position, duration } = useProgress(250);
  const progress = duration > 0 ? position / duration : 0;

  const song = currentIndex >= 0 ? songs[currentIndex] : null;
  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef(null);
  const progressBarX = useRef(0);
  const progressBarW = useRef(0);

  const displayProgress = dragging ? dragProgress : progress;
  const displayPosition = dragging ? dragProgress * duration : position;

  // ── Progress bar PanResponder ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setDragging(true);
        const ratio = Math.max(0, Math.min(1,
          (e.nativeEvent.pageX - progressBarX.current) / progressBarW.current
        ));
        setDragProgress(ratio);
      },
      onPanResponderMove: (e) => {
        const ratio = Math.max(0, Math.min(1,
          (e.nativeEvent.pageX - progressBarX.current) / progressBarW.current
        ));
        setDragProgress(ratio);
      },
      onPanResponderRelease: (e) => {
        const ratio = Math.max(0, Math.min(1,
          (e.nativeEvent.pageX - progressBarX.current) / progressBarW.current
        ));
        if (duration) seek(ratio * duration);
        setDragging(false);
      },
      onPanResponderTerminate: () => setDragging(false),
    })
  ).current;

  if (!song) return null;

  const isFav = song.favorite;
  const shuffle = settings.shuffle;
  const repeat = settings.repeat; // 0=off 1=all 2=one

  const repeatIcon = repeat === 2 ? '🔂' : repeat === 1 ? '🔁' : '🔁';
  const repeatColor = repeat > 0 ? theme.primary : theme.textMuted;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {/* Background glow */}
      <LinearGradient
        colors={[`${theme.primary}18`, theme.bg, theme.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.hdrBtn, { backgroundColor: `${theme.primary}15` }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.hdrBtnTxt, { color: theme.primaryLight }]}>⌄</Text>
          </TouchableOpacity>

          <Text style={[styles.hdrTitle, { color: theme.textMuted }]}>
            {t('nowPlaying', lang)}
          </Text>

          <TouchableOpacity
            style={[styles.hdrBtn, { backgroundColor: `${theme.primary}15` }]}
            onPress={() => navigation.navigate('SongOptions', { songId: song.id })}
          >
            <Text style={[styles.hdrBtnTxt, { color: theme.primaryLight }]}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artWrap}>
          <View style={[styles.artShadow, {
            shadowColor: theme.primary,
            shadowOpacity: isPlaying ? 0.5 : 0.2,
          }]}>
            {song.artwork ? (
              <Image source={{ uri: song.artwork }} style={styles.art} />
            ) : (
              <LinearGradient
                colors={[theme.primaryDark, '#0a0a18']}
                style={styles.art}
              >
                <Text style={styles.artIcon}>♪</Text>
              </LinearGradient>
            )}
          </View>
        </View>

        {/* Info + Favorite */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={[styles.songArtist, { color: theme.textMuted }]} numberOfLines={1}>
              {song.artist || t('unknownArtist', lang)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.favBtn, isFav && { backgroundColor: `${theme.accent}20` }]}
            onPress={() => toggleFavorite(song.id)}
          >
            <Text style={[styles.favIcon, { color: isFav ? theme.accent : theme.textMuted }]}>
              {isFav ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View
            style={styles.progressTrack}
            ref={progressBarRef}
            onLayout={(e) => {
              progressBarX.current = e.nativeEvent.layout.x;
              progressBarW.current = e.nativeEvent.layout.width;
            }}
            {...panResponder.panHandlers}
          >
            <View style={[styles.progressBg, { backgroundColor: `${theme.text}18` }]}>
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${displayProgress * 100}%` }]}
              />
              {/* Thumb */}
              <View
                style={[
                  styles.thumb,
                  {
                    left: `${displayProgress * 100}%`,
                    backgroundColor: '#fff',
                    shadowColor: theme.primary,
                    transform: [{ translateX: -8 }, { scale: dragging ? 1.4 : 1 }],
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: theme.textMuted }]}>
              {fmtTime(displayPosition)}
            </Text>
            <Text style={[styles.time, { color: theme.textMuted }]}>
              {fmtTime(duration)}
            </Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleShuffle}
            style={styles.ctrlBtn}
          >
            <Text style={[styles.ctrlIcon, { color: shuffle ? theme.primary : theme.textMuted }]}>
              ⇄
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={prev} style={styles.ctrlBtn}>
            <Text style={[styles.ctrlIcon, { color: theme.text, fontSize: 28 }]}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playBtn, {
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
            }]}
            onPress={togglePlay}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.gradient}
              style={styles.playGrad}
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={next} style={styles.ctrlBtn}>
            <Text style={[styles.ctrlIcon, { color: theme.text, fontSize: 28 }]}>⏭</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={cycleRepeat} style={styles.ctrlBtn}>
            <Text style={[styles.ctrlIcon, { color: repeatColor }]}>
              {repeat === 2 ? '🔂' : '🔁'}
            </Text>
            {repeat === 0 && (
              <View style={[styles.repeatOff, { backgroundColor: theme.textMuted }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Extra Buttons */}
        <View style={[styles.extras, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigation.navigate('Lyrics')}
          >
            <Text style={{ fontSize: 16 }}>💬</Text>
            <Text style={[styles.extraLabel, { color: theme.textMuted }]}>
              {t('lyrics', lang)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigation.navigate('Equalizer')}
          >
            <Text style={{ fontSize: 16 }}>🎛</Text>
            <Text style={[styles.extraLabel, { color: theme.textMuted }]}>EQ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigation.navigate('SleepTimer')}
          >
            <Text style={{ fontSize: 16 }}>🌙</Text>
            <Text style={[styles.extraLabel, { color: theme.textMuted }]}>
              {t('sleepTimer', lang)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.extraBtn}
            onPress={() => navigation.navigate('Playtime')}
          >
            <Text style={{ fontSize: 16 }}>📊</Text>
            <Text style={[styles.extraLabel, { color: theme.textMuted }]}>
              {t('playtime', lang)}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  hdrBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hdrBtnTxt: { fontSize: 18, fontWeight: '900' },
  hdrTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  artWrap: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  artShadow: {
    width: SCREEN_W - 80,
    height: SCREEN_W - 80,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  art: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artIcon: { fontSize: 64, opacity: 0.3, color: '#fff' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  infoText: { flex: 1 },
  songTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  songArtist: { fontSize: 14 },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: { fontSize: 22 },
  progressSection: { paddingHorizontal: 24, marginBottom: 8 },
  progressTrack: {
    paddingVertical: 14, // large hit area
    marginVertical: -14,
  },
  progressBg: {
    height: 5,
    borderRadius: 5,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: { fontSize: 11 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  ctrlBtn: { padding: 8, position: 'relative' },
  ctrlIcon: { fontSize: 22 },
  playBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  playGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 26, color: '#fff' },
  repeatOff: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  extras: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  extraBtn: { flex: 1, alignItems: 'center', gap: 4 },
  extraLabel: { fontSize: 10, fontWeight: '600' },
});
