// ─── SettingsScreen ────────────────────────────────────────────────
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useStore } from '../store/useStore';
import { THEMES } from '../constants/themes';
import { LANG, t } from '../constants/i18n';

const THEME_COLORS = {
  purple: ['#8B5CF6', '#EC4899'],
  blue: ['#3B82F6', '#06B6D4'],
  green: ['#10B981', '#F59E0B'],
  red: ['#EF4444', '#F97316'],
  rose: ['#EC4899', '#8B5CF6'],
};

export function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearStats, persist } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;
  const lang = settings.language || 'ar';

  const save = (patch) => {
    updateSettings(patch);
    setTimeout(persist, 300);
  };

  const Section = ({ title, children }) => (
    <View style={[styles.section, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      {children}
    </View>
  );

  const Row = ({ label, children }) => (
    <View style={[styles.row, { borderTopColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backTxt, { color: theme.primaryLight }]}>‹ {t('settings', lang)}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Theme */}
        <Section title={t('theme', lang)}>
          <View style={styles.themeRow}>
            {Object.entries(THEME_COLORS).map(([name, colors]) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeBtn,
                  settings.theme === name && styles.themeBtnActive,
                  settings.theme === name && { borderColor: colors[0] },
                ]}
                onPress={() => save({ theme: name })}
              >
                <View style={[styles.themeGrad, { backgroundColor: colors[0] }]}>
                  <View style={[styles.themeGrad2, { backgroundColor: colors[1] }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Language */}
        <Section title={t('language', lang)}>
          <View style={styles.langRow}>
            {['ar', 'en', 'fr', 'es'].map(l => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.langBtn,
                  { borderColor: settings.language === l ? theme.primary : theme.border },
                  settings.language === l && { backgroundColor: `${theme.primary}20` },
                ]}
                onPress={() => save({ language: l })}
              >
                <Text style={[styles.langTxt, { color: settings.language === l ? theme.primaryLight : theme.textMuted }]}>
                  {l === 'ar' ? 'العربية' : l === 'en' ? 'English' : l === 'fr' ? 'Français' : 'Español'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Playback */}
        <Section title={t('playback', lang)}>
          <Row label={t('speed', lang)}>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={[styles.sliderVal, { color: theme.primaryLight }]}>
                {settings.speed.toFixed(1)}x
              </Text>
              <Slider
                style={{ width: 140, height: 30 }}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={settings.speed}
                onValueChange={v => save({ speed: Math.round(v * 10) / 10 })}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primaryLight}
              />
            </View>
          </Row>
        </Section>

        {/* Data */}
        <Section title={t('data', lang)}>
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: '#EF4444' }]}
            onPress={() => { clearStats(); persist(); }}
          >
            <Text style={styles.dangerTxt}>{t('clearData', lang)}</Text>
          </TouchableOpacity>
        </Section>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: {},
  backTxt: { fontSize: 17, fontWeight: '700' },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  sliderVal: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  themeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  themeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  themeBtnActive: { borderWidth: 2.5 },
  themeGrad: { width: '100%', height: '100%', position: 'relative' },
  themeGrad2: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '50%',
    height: '50%',
    borderTopLeftRadius: 20,
  },
  langRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  langTxt: { fontSize: 13, fontWeight: '700' },
  dangerBtn: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  dangerTxt: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
});
