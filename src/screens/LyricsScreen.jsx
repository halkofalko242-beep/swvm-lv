// ─── LyricsScreen ──────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { THEMES } from '../constants/themes';
import { t } from '../constants/i18n';

export function LyricsScreen({ navigation }) {
  const { songs, currentIndex, settings, lyrics, setLyrics } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';

  const song = currentIndex >= 0 ? songs[currentIndex] : null;
  const stored = song ? lyrics[song.filename] : null;

  const [text, setText] = useState(stored?.text || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(stored?.source || '');

  useEffect(() => {
    if (stored) { setText(stored.text); setSource(stored.source); }
  }, [song?.id]);

  const fetchLyrics = async () => {
    if (!song) return;
    setLoading(true);
    const name = encodeURIComponent(song.title.replace(/\s*\(.*?\)\s*/g, '').trim());
    const artist = encodeURIComponent((song.artist || '').trim());
    try {
      // Try lrclib first
      const r1 = await fetch(`https://lrclib.net/api/get?track_name=${name}&artist_name=${artist}`);
      if (r1.ok) {
        const d = await r1.json();
        const lrc = d.syncedLyrics || d.plainLyrics;
        if (lrc) {
          setText(lrc);
          setSource('lrclib.net');
          setLyrics(song.filename, lrc, 'lrclib.net');
          setLoading(false);
          return;
        }
      }
      // Fallback: lyrics.ovh
      const r2 = await fetch(`https://api.lyrics.ovh/v1/${artist}/${name}`);
      if (r2.ok) {
        const d = await r2.json();
        if (d.lyrics) {
          setText(d.lyrics);
          setSource('lyrics.ovh');
          setLyrics(song.filename, d.lyrics, 'lyrics.ovh');
          setLoading(false);
          return;
        }
      }
      setText('');
      setSource('');
    } catch (e) {
      console.error('lyrics fetch', e);
    }
    setLoading(false);
  };

  const saveLyrics = () => {
    if (song) setLyrics(song.filename, text, 'manual');
    setEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: theme.primaryLight }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{t('lyrics', lang)}</Text>
          <View style={styles.hdrActions}>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={[styles.hdrBtn, { color: theme.textMuted }]}>✏️</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={saveLyrics}>
                <Text style={[styles.hdrBtn, { color: theme.primary }]}>{t('save', lang)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Song info */}
      {song && (
        <View style={[styles.songInfo, { borderBottomColor: theme.border }]}>
          <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>{song.title}</Text>
          <Text style={[styles.songArtist, { color: theme.textMuted }]}>{song.artist}</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: 60 }} />
        ) : editing ? (
          <TextInput
            style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
            value={text}
            onChangeText={setText}
            multiline
            placeholder={t('noLyrics', lang)}
            placeholderTextColor={theme.textMuted}
            textAlignVertical="top"
          />
        ) : text ? (
          <>
            {source && (
              <Text style={[styles.sourceLabel, { color: theme.textMuted }]}>
                {t('lyricsSource', lang)}: {source}
              </Text>
            )}
            <Text style={[styles.lyricsText, { color: theme.text }]}>{text}</Text>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyIcon, { color: theme.textMuted }]}>💬</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t('noLyrics', lang)}</Text>
            <TouchableOpacity
              style={[styles.fetchBtn, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}
              onPress={fetchLyrics}
            >
              <Text style={[styles.fetchTxt, { color: theme.primaryLight }]}>
                {t('fetchLyrics', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Fetch button */}
      {!editing && !loading && (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.fetchBtnFull, { backgroundColor: `${theme.primary}15`, borderColor: theme.border }]}
            onPress={fetchLyrics}
          >
            <Text style={[styles.fetchTxt, { color: theme.primaryLight }]}>
              🔄 {t('fetchLyrics', lang)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  back: { fontSize: 28, fontWeight: '300', marginRight: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '800' },
  hdrActions: { flexDirection: 'row', gap: 12 },
  hdrBtn: { fontSize: 16, fontWeight: '700' },
  songInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  songTitle: { fontSize: 15, fontWeight: '700' },
  songArtist: { fontSize: 12, marginTop: 2 },
  lyricsText: { fontSize: 15, lineHeight: 26, textAlign: 'center' },
  sourceLabel: { fontSize: 10, textAlign: 'center', marginBottom: 16 },
  editInput: {
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 300,
  },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14 },
  fetchBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  fetchTxt: { fontWeight: '700', fontSize: 13 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  fetchBtnFull: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
