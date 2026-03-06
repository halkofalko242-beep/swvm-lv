// ─── SongCard ──────────────────────────────────────────────────────
import React, { memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { fmtDuration } from '../utils/format';

export const SongCard = memo(({ song, index, onPress, onLongPress, isActive, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isActive
            ? `${theme.primary}20`
            : theme.bgCard,
          borderColor: isActive
            ? `${theme.primary}50`
            : theme.border,
          shadowColor: isActive ? theme.primary : '#000',
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Artwork */}
      <View style={[styles.artwork, { borderRadius: 10 }]}>
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.artImg} />
        ) : (
          <LinearGradient
            colors={[theme.primaryDark, '#0d0d1a']}
            style={styles.artGrad}
          >
            <Text style={styles.artIcon}>♪</Text>
          </LinearGradient>
        )}
        {isActive && (
          <View style={[styles.playingDot, { backgroundColor: theme.primary }]} />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            { color: isActive ? theme.primaryLight : theme.text },
          ]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>
          {song.artist || 'Unknown Artist'}
        </Text>
      </View>

      {/* Duration + Fav */}
      <View style={styles.right}>
        {song.favorite && (
          <Text style={[styles.fav, { color: theme.accent }]}>♥</Text>
        )}
        <Text style={[styles.dur, { color: theme.textMuted }]}>
          {fmtDuration(song.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 12,
    marginBottom: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  artImg: { width: '100%', height: '100%' },
  artGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artIcon: { fontSize: 20, opacity: 0.4, color: '#fff' },
  playingDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  info: { flex: 1, marginHorizontal: 10 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  artist: { fontSize: 11 },
  right: { alignItems: 'flex-end', gap: 3 },
  fav: { fontSize: 10 },
  dur: { fontSize: 10 },
});
