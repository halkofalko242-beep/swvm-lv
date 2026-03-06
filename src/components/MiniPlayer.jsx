// ─── MiniPlayer ────────────────────────────────────────────────────
import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle, withSpring, useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';

export const MiniPlayer = memo(({
  song, isPlaying, onPress, onPlayPause, onNext, theme,
}) => {
  const { position, duration } = useProgress(500);
  const progress = duration > 0 ? position / duration : 0;

  if (!song) return null;

  return (
    <TouchableOpacity
      style={[styles.container, {
        backgroundColor: theme.bgCard,
        borderTopColor: theme.border,
        shadowColor: theme.primary,
      }]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Progress bar on top */}
      <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.row}>
        {/* Artwork */}
        <View style={styles.artwork}>
          {song.artwork ? (
            <Image source={{ uri: song.artwork }} style={styles.artImg} />
          ) : (
            <LinearGradient colors={[theme.primaryDark, '#0a0a14']} style={styles.artGrad}>
              <Text style={styles.artIcon}>♪</Text>
            </LinearGradient>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>
            {song.artist || 'Unknown'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: `${theme.primary}20` }]}
            onPress={(e) => { e.stopPropagation(); onPlayPause(); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPlaying ? (
              <View style={styles.pauseIcon}>
                <View style={[styles.pauseBar, { backgroundColor: theme.primaryLight }]} />
                <View style={[styles.pauseBar, { backgroundColor: theme.primaryLight }]} />
              </View>
            ) : (
              <Text style={[styles.playIcon, { color: theme.primaryLight }]}>▶</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onNext(); }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <Text style={[styles.nextIcon, { color: theme.textMuted }]}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  progressBg: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  artImg: { width: '100%', height: '100%' },
  artGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  artIcon: { fontSize: 18, opacity: 0.35, color: '#fff' },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  artist: { fontSize: 11 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  pauseBar: { width: 3, height: 14, borderRadius: 2 },
  playIcon: { fontSize: 14, marginLeft: 2 },
  nextIcon: { fontSize: 16 },
});
