// ─── PlaytimeScreen ────────────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { THEMES } from '../constants/themes';
import { t } from '../constants/i18n';
import { fmtPlaytime } from '../utils/format';

export function PlaytimeScreen({ navigation }) {
  const { songs, stats, settings } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';

  const totalSeconds = (stats.sessions || []).reduce((s, x) => s + (x.duration || 0), 0);
  const streak = stats.streak || { count: 0 };

  // Top songs by plays
  const topSongs = Object.entries(stats.plays || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ song: songs.find(s => s.id === id), count }))
    .filter(x => x.song);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: theme.primaryLight }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{t('playtime', lang)}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Streak */}
        <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <LinearGradient colors={[`${theme.accent}20`, 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={[styles.statBig, { color: theme.accent }]}>{streak.count || 0}</Text>
          <View>
            <Text style={[styles.statLabel, { color: theme.text }]}>{t('streak', lang)}</Text>
            <Text style={[styles.statSub, { color: theme.textMuted }]}>
              {streak.count === 1 ? t('day', lang) : t('days', lang)} {t('normal', lang)}
            </Text>
          </View>
        </View>

        {/* Total Time */}
        <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <LinearGradient colors={[`${theme.primary}20`, 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={[styles.statBig, { color: theme.primaryLight }]}>{fmtPlaytime(totalSeconds)}</Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>{t('totalTime', lang)}</Text>
        </View>

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <View style={[styles.listCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.listTitle, { color: theme.textMuted }]}>{t('topSongs', lang)}</Text>
            {topSongs.map(({ song, count }, i) => (
              <View key={song.id} style={[styles.listRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.rank, { color: i < 3 ? theme.accent : theme.textMuted }]}>
                  {i + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowSong, { color: theme.text }]} numberOfLines={1}>{song.title}</Text>
                  <Text style={[styles.rowArtist, { color: theme.textMuted }]} numberOfLines={1}>{song.artist}</Text>
                </View>
                <Text style={[styles.rowCount, { color: theme.textMuted }]}>{count}×</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontSize: 28, fontWeight: '300' },
  title: { flex: 1, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  statBig: { fontSize: 40, fontWeight: '900' },
  statLabel: { fontSize: 14, fontWeight: '700' },
  statSub: { fontSize: 11, marginTop: 2 },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  listTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  rank: { width: 22, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  rowSong: { fontSize: 13, fontWeight: '700' },
  rowArtist: { fontSize: 11, marginTop: 1 },
  rowCount: { fontSize: 12, fontWeight: '600' },
});
