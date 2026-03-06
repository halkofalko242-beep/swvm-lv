// ─── HomeScreen ────────────────────────────────────────────────────
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { SongCard } from '../components/SongCard';
import { MiniPlayer } from '../components/MiniPlayer';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { THEMES } from '../constants/themes';
import { LANG, t } from '../constants/i18n';
import { fmtDuration } from '../utils/format';

const TABS = ['songs', 'playlists', 'artists', 'albums'];

export function HomeScreen({ navigation }) {
  const {
    songs, currentIndex, isPlaying, playlists,
    settings, activeTab, setActiveTab, searchQuery, setSearchQuery, sortMode, setSortMode,
  } = useStore();

  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';
  const isRTL = LANG[lang]?.rtl ?? true;
  const { play, togglePlay, next } = useAudioPlayer();

  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // ── Sorted + Filtered Songs ──
  const displaySongs = useMemo(() => {
    let list = [...songs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q)
      );
    }
    switch (sortMode) {
      case 'az': list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za': list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'recent': list.sort((a, b) => b.creationTime - a.creationTime); break;
      case 'plays': list.sort((a, b) => (b.plays || 0) - (a.plays || 0)); break;
    }
    return list;
  }, [songs, searchQuery, sortMode]);

  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;

  const handleSongPress = useCallback((song, index) => {
    // Find actual index in original songs array
    const realIndex = songs.findIndex(s => s.id === song.id);
    play(realIndex);
    navigation.navigate('NowPlaying');
  }, [songs, play, navigation]);

  const renderSong = useCallback(({ item, index }) => (
    <SongCard
      key={item.id}
      song={item}
      index={index}
      isActive={item.id === currentSong?.id}
      theme={theme}
      onPress={() => handleSongPress(item, index)}
      onLongPress={() => navigation.navigate('SongOptions', { songId: item.id })}
    />
  ), [currentSong, theme, handleSongPress]);

  const renderPlaylist = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.plCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
      onPress={() => navigation.navigate('Playlist', { playlistId: item.id })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[theme.primaryDark, theme.bgSurface]}
        style={styles.plArt}
      >
        <Text style={styles.plArtIcon}>♫</Text>
      </LinearGradient>
      <View style={styles.plInfo}>
        <Text style={[styles.plName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.plCount, { color: theme.textMuted }]}>
          {item.songs.length} {t('songCount', lang)}
        </Text>
      </View>
    </TouchableOpacity>
  ), [theme, lang]);

  // ── Group by Artist ──
  const artists = useMemo(() => {
    const map = {};
    songs.forEach(s => {
      const a = s.artist || t('unknownArtist', lang);
      if (!map[a]) map[a] = { name: a, count: 0, artwork: null };
      map[a].count++;
      if (!map[a].artwork && s.artwork) map[a].artwork = s.artwork;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  // ── Group by Album ──
  const albums = useMemo(() => {
    const map = {};
    songs.forEach(s => {
      const al = s.album || t('unknown', lang);
      if (!map[al]) map[al] = { name: al, artist: s.artist, count: 0, artwork: null };
      map[al].count++;
      if (!map[al].artwork && s.artwork) map[al].artwork = s.artwork;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  const renderArtist = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
      onPress={() => navigation.navigate('Artist', { name: item.name })}
      activeOpacity={0.7}
    >
      <LinearGradient colors={[theme.primaryDark, theme.bg]} style={styles.gridArt}>
        <Text style={styles.gridIcon}>👤</Text>
      </LinearGradient>
      <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.gridSub, { color: theme.textMuted }]}>{item.count} {t('songCount', lang)}</Text>
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
      onPress={() => navigation.navigate('Album', { name: item.name })}
      activeOpacity={0.7}
    >
      <LinearGradient colors={[theme.primaryDark, theme.bg]} style={styles.gridArt}>
        <Text style={styles.gridIcon}>💿</Text>
      </LinearGradient>
      <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.gridSub, { color: theme.textMuted }]}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          {showSearch ? (
            <View style={[styles.searchBar, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              <Text style={{ color: theme.textMuted }}>🔍</Text>
              <TextInput
                ref={searchRef}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder={t('searchPlaceholder', lang)}
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => navigation.openDrawer()}
              >
                <View style={[styles.menuLine, { backgroundColor: theme.text }]} />
                <View style={[styles.menuLine, { backgroundColor: theme.text, width: 16 }]} />
                <View style={[styles.menuLine, { backgroundColor: theme.text }]} />
              </TouchableOpacity>

              <Text style={[styles.appTitle, { color: theme.text }]}>SWVM</Text>

              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)}>
                <Text style={{ color: theme.textMuted, fontSize: 18 }}>🔍</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab ? theme.primaryLight : theme.textMuted },
            ]}>
              {t(tab, lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'songs' && (
        <FlatList
          data={displaySongs}
          renderItem={renderSong}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={15}
          windowSize={10}
          initialNumToRender={20}
          getItemLayout={(_, index) => ({ length: 70, offset: 70 * index, index })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {t('noSongs', lang)}
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'playlists' && (
        <FlatList
          data={playlists}
          renderItem={renderPlaylist}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.newPlBtn, { borderColor: theme.primary, backgroundColor: `${theme.primary}10` }]}
              onPress={() => navigation.navigate('NewPlaylist')}
            >
              <Text style={{ color: theme.primary, fontWeight: '700' }}>+ {t('newPlaylist', lang)}</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textMuted, textAlign: 'center', marginTop: 40 }]}>
              {t('noPlaylists', lang)}
            </Text>
          }
        />
      )}

      {activeTab === 'artists' && (
        <FlatList
          data={artists}
          renderItem={renderArtist}
          keyExtractor={item => item.name}
          numColumns={2}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 8 }}
        />
      )}

      {activeTab === 'albums' && (
        <FlatList
          data={albums}
          renderItem={renderAlbum}
          keyExtractor={item => item.name}
          numColumns={2}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 8 }}
        />
      )}

      {/* Mini Player */}
      {currentSong && (
        <View style={styles.miniPlayerWrap}>
          <MiniPlayer
            song={currentSong}
            isPlaying={isPlaying}
            theme={theme}
            onPress={() => navigation.navigate('NowPlaying')}
            onPlayPause={togglePlay}
            onNext={next}
          />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  menuBtn: { gap: 4, padding: 4 },
  menuLine: { height: 2, width: 20, borderRadius: 1 },
  iconBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabel: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 14 },
  miniPlayerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  plCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  plArt: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plArtIcon: { fontSize: 22, color: 'rgba(255,255,255,0.4)' },
  plInfo: { flex: 1 },
  plName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  plCount: { fontSize: 11 },
  newPlBtn: {
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gridArt: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIcon: { fontSize: 32 },
  gridName: { fontSize: 12, fontWeight: '700', padding: 8, paddingBottom: 2 },
  gridSub: { fontSize: 10, paddingHorizontal: 8, paddingBottom: 8 },
});
