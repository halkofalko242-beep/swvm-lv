// ─── EqualizerScreen ───────────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useStore } from '../store/useStore';
import { THEMES } from '../constants/themes';
import { EQ_PRESETS, EQ_BANDS } from '../constants/eqPresets';
import { t } from '../constants/i18n';

export function EqualizerScreen({ navigation }) {
  const { settings, updateSettings, persist } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';
  const bands = settings.eqBands || [0, 0, 0, 0, 0, 0];

  const setBand = (i, v) => {
    const newBands = [...bands];
    newBands[i] = Math.round(v);
    updateSettings({ eqBands: newBands, eqPreset: 'Custom' });
  };

  const applyPreset = (name) => {
    updateSettings({ eqBands: [...EQ_PRESETS[name]], eqPreset: name });
    setTimeout(persist, 300);
  };

  const fmtHz = (hz) => hz >= 1000 ? `${hz / 1000}k` : `${hz}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: theme.primaryLight }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{t('equalizer', lang)}</Text>
          <TouchableOpacity onPress={() => applyPreset('Normal')}>
            <Text style={[styles.reset, { color: theme.textMuted }]}>{t('normal', lang)}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Presets */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
          {Object.keys(EQ_PRESETS).map(name => (
            <TouchableOpacity
              key={name}
              style={[
                styles.presetBtn,
                {
                  borderColor: settings.eqPreset === name ? theme.primary : theme.border,
                  backgroundColor: settings.eqPreset === name ? `${theme.primary}20` : theme.bgCard,
                },
              ]}
              onPress={() => applyPreset(name)}
            >
              <Text style={[
                styles.presetTxt,
                { color: settings.eqPreset === name ? theme.primaryLight : theme.textMuted },
              ]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EQ Bands */}
        <View style={[styles.bandsCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {bands.map((val, i) => (
            <View key={i} style={styles.band}>
              <Text style={[styles.bandVal, { color: theme.primaryLight }]}>
                {val > 0 ? '+' : ''}{val}
              </Text>
              <Slider
                style={styles.bandSlider}
                minimumValue={-10}
                maximumValue={10}
                step={1}
                value={val}
                onValueChange={v => setBand(i, v)}
                onSlidingComplete={() => persist()}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primaryLight}
              />
              <Text style={[styles.bandHz, { color: theme.textMuted }]}>
                {fmtHz(EQ_BANDS[i])}
              </Text>
            </View>
          ))}
        </View>

        {/* Bass Boost */}
        <View style={[styles.extraCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.extraRow}>
            <Text style={[styles.extraLabel, { color: theme.text }]}>{t('bass', lang)}</Text>
            <Text style={[styles.extraVal, { color: theme.primaryLight }]}>{settings.bass || 0}%</Text>
          </View>
          <Slider
            style={styles.fullSlider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={settings.bass || 0}
            onValueChange={v => updateSettings({ bass: v })}
            onSlidingComplete={() => persist()}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primaryLight}
          />

          <View style={[styles.extraRow, { marginTop: 12 }]}>
            <Text style={[styles.extraLabel, { color: theme.text }]}>{t('reverb', lang)}</Text>
            <Text style={[styles.extraVal, { color: theme.primaryLight }]}>{settings.reverb || 0}%</Text>
          </View>
          <Slider
            style={styles.fullSlider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={settings.reverb || 0}
            onValueChange={v => updateSettings({ reverb: v })}
            onSlidingComplete={() => persist()}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primaryLight}
          />
        </View>
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
  back: { fontSize: 28, fontWeight: '300', marginRight: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '800' },
  reset: { fontSize: 13 },
  presetsScroll: { marginBottom: 16 },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  presetTxt: { fontSize: 12, fontWeight: '700' },
  bandsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  band: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bandVal: { width: 32, fontSize: 11, fontWeight: '700', textAlign: 'right' },
  bandSlider: { flex: 1, height: 30 },
  bandHz: { width: 32, fontSize: 10, textAlign: 'left' },
  extraCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  extraLabel: { fontSize: 13, fontWeight: '600' },
  extraVal: { fontSize: 13, fontWeight: '700' },
  fullSlider: { width: '100%', height: 30, marginTop: 4 },
});
