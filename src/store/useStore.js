// ─── SWVM Global Store (Zustand) ───────────────────────────────────
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, DEFAULT_THEME } from '../constants/themes';
import { EQ_PRESETS } from '../constants/eqPresets';

const STORE_KEY = 'swvm_store_v1';

const defaultState = {
  // ── Songs ──
  songs: [],
  currentIndex: -1,
  isPlaying: false,
  queue: [],
  customQueue: [],

  // ── Playlists ──
  playlists: [],

  // ── Lyrics ──
  lyrics: {},  // { filename: { text, source } }

  // ── Stats ──
  stats: {
    sessions: [],    // [{ date, duration, songId }]
    plays: {},       // { songId: count }
    streak: { last: null, count: 0 },
  },

  // ── Settings ──
  settings: {
    theme: DEFAULT_THEME,
    language: 'ar',
    shuffle: false,
    repeat: 0,        // 0=off 1=all 2=one
    speed: 1.0,
    volume: 1.0,
    eqPreset: 'Normal',
    eqBands: [0, 0, 0, 0, 0, 0],
    bass: 0,
    reverb: 0,
    sleepTimer: null,
    showLyrics: false,
  },

  // ── UI ──
  activeTab: 'songs',
  searchQuery: '',
  sortMode: 'az',
};

export const useStore = create((set, get) => ({
  ...defaultState,

  // ═══ SONGS ═══════════════════════════════════════
  setSongs: (songs) => set({ songs }),
  addSongs: (newSongs) => set((s) => {
    const existing = new Set(s.songs.map(x => x.id));
    const merged = [...s.songs, ...newSongs.filter(x => !existing.has(x.id))];
    return { songs: merged };
  }),

  setCurrentIndex: (idx) => set({ currentIndex: idx }),
  setIsPlaying: (v) => set({ isPlaying: v }),

  // ═══ PLAYLISTS ════════════════════════════════════
  addPlaylist: (pl) => set((s) => ({ playlists: [...s.playlists, pl] })),
  updatePlaylist: (id, data) => set((s) => ({
    playlists: s.playlists.map(p => p.id === id ? { ...p, ...data } : p),
  })),
  deletePlaylist: (id) => set((s) => ({
    playlists: s.playlists.filter(p => p.id !== id),
  })),
  addSongToPlaylist: (plId, songId) => set((s) => ({
    playlists: s.playlists.map(p =>
      p.id === plId && !p.songs.includes(songId)
        ? { ...p, songs: [...p.songs, songId] }
        : p
    ),
  })),
  removeSongFromPlaylist: (plId, songId) => set((s) => ({
    playlists: s.playlists.map(p =>
      p.id === plId ? { ...p, songs: p.songs.filter(x => x !== songId) } : p
    ),
  })),

  // ═══ SONG META ════════════════════════════════════
  toggleFavorite: (id) => set((s) => ({
    songs: s.songs.map(song =>
      song.id === id ? { ...song, favorite: !song.favorite } : song
    ),
  })),
  updateSong: (id, data) => set((s) => ({
    songs: s.songs.map(song => song.id === id ? { ...song, ...data } : song),
  })),
  deleteSong: (id) => set((s) => ({
    songs: s.songs.filter(s => s.id !== id),
    playlists: s.playlists.map(p => ({
      ...p, songs: p.songs.filter(x => x !== id),
    })),
  })),
  incrementPlays: (id) => set((s) => ({
    stats: {
      ...s.stats,
      plays: { ...s.stats.plays, [id]: (s.stats.plays[id] || 0) + 1 },
    },
  })),

  // ═══ LYRICS ═══════════════════════════════════════
  setLyrics: (filename, text, source) => set((s) => ({
    lyrics: { ...s.lyrics, [filename]: { text, source } },
  })),

  // ═══ STATS ════════════════════════════════════════
  recordSession: (songId, duration) => set((s) => {
    const today = new Date().toDateString();
    const last = s.stats.streak.last;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === today
      ? s.stats.streak
      : last === yesterday
        ? { last: today, count: s.stats.streak.count + 1 }
        : { last: today, count: 1 };
    return {
      stats: {
        ...s.stats,
        sessions: [...s.stats.sessions.slice(-500), { date: today, duration, songId }],
        streak: newStreak,
      },
    };
  }),
  clearStats: () => set({ stats: defaultState.stats }),

  // ═══ SETTINGS ═════════════════════════════════════
  updateSettings: (patch) => set((s) => ({
    settings: { ...s.settings, ...patch },
  })),

  // ═══ UI ═══════════════════════════════════════════
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortMode: (m) => set({ sortMode: m }),

  // ═══ QUEUE ════════════════════════════════════════
  buildQueue: (startIndex) => {
    const { songs, settings } = get();
    let q = songs.map((_, i) => i);
    if (settings.shuffle) {
      // Fisher-Yates shuffle keeping startIndex first
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      q = [startIndex, ...q.filter(x => x !== startIndex)];
    }
    set({ queue: q, customQueue: [] });
    return q;
  },

  getNextIndex: () => {
    const { currentIndex, queue, customQueue, settings, songs } = get();
    if (customQueue.length > 0) {
      const next = customQueue[0];
      set({ customQueue: customQueue.slice(1) });
      return next;
    }
    if (settings.repeat === 2) return currentIndex;
    const pos = queue.indexOf(currentIndex);
    if (pos < queue.length - 1) return queue[pos + 1];
    if (settings.repeat === 1) return queue[0];
    return -1;
  },

  getPrevIndex: () => {
    const { currentIndex, queue } = get();
    const pos = queue.indexOf(currentIndex);
    return pos > 0 ? queue[pos - 1] : queue[queue.length - 1];
  },

  // ═══ PERSIST ══════════════════════════════════════
  persist: async () => {
    const s = get();
    const data = {
      songs: s.songs.map(x => ({
        ...x,
        // don't persist the uri directly - will rescan
        uri: undefined,
      })),
      playlists: s.playlists,
      lyrics: s.lyrics,
      stats: s.stats,
      settings: s.settings,
      sortMode: s.sortMode,
    };
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('persist error', e);
    }
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        playlists: data.playlists || [],
        lyrics: data.lyrics || {},
        stats: data.stats || defaultState.stats,
        settings: { ...defaultState.settings, ...(data.settings || {}) },
        sortMode: data.sortMode || 'az',
        // songs meta (without uri) for merging after scan
        _savedSongsMeta: data.songs || [],
      });
    } catch (e) {
      console.warn('hydrate error', e);
    }
  },

  mergeSongsMeta: (scannedSongs) => {
    const saved = get()._savedSongsMeta || [];
    const metaMap = {};
    saved.forEach(s => {
      if (s.filename) metaMap[s.filename] = s;
    });
    const merged = scannedSongs.map(song => {
      const meta = metaMap[song.filename];
      if (meta) {
        return {
          ...song,
          title: meta.title || song.title,
          artist: meta.artist || song.artist,
          album: meta.album || song.album,
          artwork: meta.artwork || song.artwork,
          favorite: meta.favorite || false,
          plays: meta.plays || 0,
        };
      }
      return song;
    });
    set({ songs: merged, _savedSongsMeta: null });
    return merged;
  },
}));
