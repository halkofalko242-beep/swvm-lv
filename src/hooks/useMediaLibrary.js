// ─── useMediaLibrary ───────────────────────────────────────────────
// Scans ALL audio files on device using expo-media-library
import { useState, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { useStore } from '../store/useStore';

export function useMediaLibrary() {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { mergeSongsMeta, setSongs } = useStore();

  const requestPermission = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const checkPermission = useCallback(async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const scanLibrary = useCallback(async () => {
    setScanning(true);
    setScanProgress(0);

    try {
      // Get all audio assets from device media library
      const allAssets = [];
      let hasMore = true;
      let after = null;
      let total = 0;

      // First pass: count total
      const countRes = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1,
      });
      total = countRes.totalCount;

      // Paginated fetch - get ALL songs
      while (hasMore) {
        const res = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 100,
          after,
          sortBy: MediaLibrary.SortBy.default,
        });

        const batch = res.assets.map(asset => ({
          id: asset.id,
          filename: asset.filename,
          title: stripExtension(asset.filename),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: asset.duration,
          uri: asset.uri,
          artwork: null,
          favorite: false,
          plays: 0,
          creationTime: asset.creationTime,
        }));

        allAssets.push(...batch);
        setScanProgress(Math.round((allAssets.length / total) * 100));

        hasMore = res.hasNextPage;
        after = res.endCursor;
      }

      // Merge with saved metadata (titles, artist edits, favorites etc.)
      const merged = mergeSongsMeta(allAssets);
      return merged;
    } catch (e) {
      console.error('scan error', e);
      return [];
    } finally {
      setScanning(false);
      setScanProgress(100);
    }
  }, [mergeSongsMeta]);

  return {
    permissionStatus,
    scanning,
    scanProgress,
    requestPermission,
    checkPermission,
    scanLibrary,
  };
}

function stripExtension(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}
