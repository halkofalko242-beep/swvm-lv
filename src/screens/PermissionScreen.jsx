// ─── PermissionScreen ──────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useStore } from '../store/useStore';
import { THEMES } from '../constants/themes';
import { t } from '../constants/i18n';

export function PermissionScreen({ onDone }) {
  const { settings } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';
  const { requestPermission, scanLibrary, scanning, scanProgress } = useMediaLibrary();
  const { setSongs, mergeSongsMeta } = useStore();
  const [step, setStep] = useState('idle'); // idle | scanning | done | error

  const handleGrant = async () => {
    const granted = await requestPermission();
    if (!granted) {
      setStep('error');
      return;
    }
    setStep('scanning');
    const songs = await scanLibrary();
    setSongs(songs);
    setStep('done');
    setTimeout(onDone, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      <LinearGradient
        colors={[`${theme.primary}25`, 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: '40%' }]}
      />

      {/* Logo */}
      <View style={styles.logoWrap}>
        <LinearGradient
          colors={theme.gradient}
          style={styles.logoCircle}
        >
          <Text style={styles.logoText}>♫</Text>
        </LinearGradient>
        <Text style={[styles.appName, { color: theme.text }]}>SWVM</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>
          Your music. Your way.
        </Text>
      </View>

      {/* Status */}
      <View style={styles.center}>
        {step === 'scanning' && (
          <View style={styles.scanWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.scanTxt, { color: theme.text }]}>
              {t('scanning', lang)} {scanProgress}%
            </Text>
            <View style={[styles.scanBar, { backgroundColor: theme.border }]}>
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.scanFill, { width: `${scanProgress}%` }]}
              />
            </View>
          </View>
        )}

        {step === 'error' && (
          <Text style={[styles.errorTxt, { color: '#EF4444' }]}>
            يحتاج التطبيق إذن للوصول للملفات
          </Text>
        )}
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Text style={[styles.permTitle, { color: theme.text }]}>
          {t('permTitle', lang)}
        </Text>
        <Text style={[styles.permSub, { color: theme.textMuted }]}>
          {t('permSub', lang)}
        </Text>

        {step !== 'scanning' && (
          <TouchableOpacity
            style={[styles.grantBtn, { shadowColor: theme.primary }]}
            onPress={handleGrant}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.grantGrad}
            >
              <Text style={styles.grantTxt}>{t('permBtn', lang)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {step !== 'scanning' && (
          <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
            <Text style={[styles.skipTxt, { color: theme.textMuted }]}>
              {t('permSkip', lang)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: { fontSize: 44, color: '#fff' },
  appName: { fontSize: 36, fontWeight: '900', letterSpacing: 4 },
  tagline: { fontSize: 13, letterSpacing: 1 },
  center: { alignItems: 'center', minHeight: 80, justifyContent: 'center' },
  scanWrap: { alignItems: 'center', gap: 12 },
  scanTxt: { fontSize: 14, fontWeight: '600' },
  scanBar: {
    width: 200,
    height: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scanFill: { height: '100%', borderRadius: 4 },
  errorTxt: { fontSize: 13, textAlign: 'center' },
  bottom: {
    padding: 32,
    gap: 12,
  },
  permTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  permSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  grantBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  grantGrad: { paddingVertical: 16, alignItems: 'center' },
  grantTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipTxt: { fontSize: 13 },
});
