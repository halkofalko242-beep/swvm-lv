SWVM Expo App Structure:

src/
  constants/
    themes.js       - color themes (5 themes)
    i18n.js         - AR/EN/FR/ES translations
    eqPresets.js    - EQ presets
  store/
    useStore.js     - Zustand store (songs, playlists, settings, stats)
  hooks/
    useAudioPlayer.js  - audio playback, EQ, volume
    useMediaLibrary.js - expo-media-library file scanning
  screens/
    HomeScreen.jsx     - tabs: songs/playlists/artists/albums
    NowPlayingScreen.jsx
    LyricsScreen.jsx
    PlaytimeScreen.jsx
    WrappedScreen.jsx
    EqualizerScreen.jsx
    SettingsScreen.jsx
    PlaylistScreen.jsx
    ArtistScreen.jsx
    AlbumScreen.jsx
  components/
    SongCard.jsx
    MiniPlayer.jsx
    PlaylistCard.jsx
    ArtistCard.jsx
    AlbumCard.jsx
    ProgressBar.jsx
    DrawerMenu.jsx
    SearchBar.jsx
    SleepTimer.jsx
    EditSongModal.jsx
    SortMenu.jsx
  App.jsx
  app.json
  package.json
