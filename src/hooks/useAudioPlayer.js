// ─── useAudioPlayer ────────────────────────────────────────────────
// Full audio engine using react-native-track-player
import { useEffect, useCallback, useRef } from 'react';
import TrackPlayer, {
  Event,
  State,
  RepeatMode,
  usePlaybackState,
  useProgress,
  useActiveTrack,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useStore } from '../store/useStore';

// ── Setup service (called once at app start) ──
export async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 5, // 5MB cache
    });
    await TrackPlayer.updateOptions({
      capabilities: [
        TrackPlayer.Capability.Play,
        TrackPlayer.Capability.Pause,
        TrackPlayer.Capability.SkipToNext,
        TrackPlayer.Capability.SkipToPrevious,
        TrackPlayer.Capability.SeekTo,
        TrackPlayer.Capability.Stop,
      ],
      compactCapabilities: [
        TrackPlayer.Capability.Play,
        TrackPlayer.Capability.Pause,
        TrackPlayer.Capability.SkipToNext,
      ],
      notificationCapabilities: [
        TrackPlayer.Capability.Play,
        TrackPlayer.Capability.Pause,
        TrackPlayer.Capability.SkipToNext,
        TrackPlayer.Capability.SkipToPrevious,
      ],
      android: {
        appKilledPlaybackBehavior:
          TrackPlayer.AppKilledPlaybackBehavior.ContinueIfOngoing,
      },
    });
    return true;
  } catch (e) {
    console.error('TrackPlayer setup error', e);
    return false;
  }
}

export function useAudioPlayer() {
  const {
    songs, currentIndex, setCurrentIndex, setIsPlaying,
    settings, updateSettings, getNextIndex, getPrevIndex,
    incrementPlays, recordSession, buildQueue, persist,
  } = useStore();

  const playbackState = usePlaybackState();
  const progress = useProgress();
  const activeTrack = useActiveTrack();
  const sessionStart = useRef(null);

  const isPlaying = playbackState.state === State.Playing;

  // ── Sync playing state to store ──
  useEffect(() => {
    setIsPlaying(isPlaying);
  }, [isPlaying]);

  // ── Track ended → play next ──
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.index !== null && event.index !== undefined) {
      // Record session for previous song
      if (sessionStart.current) {
        const dur = (Date.now() - sessionStart.current) / 1000;
        if (currentIndex >= 0) {
          const song = songs[currentIndex];
          if (song) recordSession(song.id, dur);
        }
      }
    }
  });

  useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
    if (settings.repeat === 1) {
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    }
  });

  // ── Play song by index ──
  const play = useCallback(async (index) => {
    if (index < 0 || index >= songs.length) return;
    const song = songs[index];
    if (!song) return;

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.id,
        url: song.uri,
        title: song.title,
        artist: song.artist || 'Unknown Artist',
        album: song.album || '',
        artwork: song.artwork || undefined,
        duration: song.duration,
      });
      await TrackPlayer.play();

      setCurrentIndex(index);
      incrementPlays(song.id);
      sessionStart.current = Date.now();

      // Preload next track for gapless
      const queue = buildQueue(index);
      const nextI = queue[queue.indexOf(index) + 1];
      if (nextI !== undefined && songs[nextI]) {
        const ns = songs[nextI];
        await TrackPlayer.add({
          id: ns.id,
          url: ns.uri,
          title: ns.title,
          artist: ns.artist || 'Unknown Artist',
          album: ns.album || '',
          artwork: ns.artwork || undefined,
          duration: ns.duration,
        });
      }

      persist();
    } catch (e) {
      console.error('play error', e);
    }
  }, [songs, setCurrentIndex, incrementPlays, buildQueue, persist]);

  // ── Toggle play/pause ──
  const togglePlay = useCallback(async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, []);

  // ── Next / Prev ──
  const next = useCallback(async () => {
    const nextI = getNextIndex();
    if (nextI >= 0) play(nextI);
  }, [getNextIndex, play]);

  const prev = useCallback(async () => {
    // If past 3s, restart current song
    if (progress.position > 3) {
      await TrackPlayer.seekTo(0);
      return;
    }
    const prevI = getPrevIndex();
    if (prevI >= 0) play(prevI);
  }, [getPrevIndex, play, progress.position]);

  // ── Seek ──
  const seek = useCallback(async (position) => {
    await TrackPlayer.seekTo(position);
  }, []);

  // ── Volume ──
  const setVolume = useCallback(async (v) => {
    await TrackPlayer.setVolume(v);
    updateSettings({ volume: v });
  }, [updateSettings]);

  // ── Speed ──
  const setSpeed = useCallback(async (s) => {
    await TrackPlayer.setRate(s);
    updateSettings({ speed: s });
  }, [updateSettings]);

  // ── Shuffle ──
  const toggleShuffle = useCallback(() => {
    updateSettings({ shuffle: !settings.shuffle });
  }, [settings.shuffle, updateSettings]);

  // ── Repeat ──
  const cycleRepeat = useCallback(async () => {
    const modes = [0, 1, 2];
    const next = modes[(modes.indexOf(settings.repeat) + 1) % 3];
    const rnModes = [RepeatMode.Off, RepeatMode.Queue, RepeatMode.Track];
    await TrackPlayer.setRepeatMode(rnModes[next]);
    updateSettings({ repeat: next });
  }, [settings.repeat, updateSettings]);

  return {
    isPlaying,
    currentIndex,
    progress,
    play,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    setSpeed,
    toggleShuffle,
    cycleRepeat,
  };
}
