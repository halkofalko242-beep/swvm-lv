// ─── EQ Presets ────────────────────────────────────────────────────
// 6 bands: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz, presence
export const EQ_BANDS = [60, 230, 910, 4000, 14000, 16000];

export const EQ_PRESETS = {
  Normal:    [0, 0, 0, 0, 0, 0],
  Pop:       [1, 3, 5, 3, 1, -1],
  Rock:      [5, 4, -1, -1, 3, 5],
  HipHop:    [6, 5, 1, -1, -1, 2],
  Jazz:      [3, 1, 2, 3, 3, 2],
  Classical: [4, 3, -1, 2, 3, 4],
  Electronic:[4, 3, 1, 2, 1, 3],
  Bass:      [8, 6, 2, -1, -2, -1],
  Vocal:     [-2, -1, 3, 5, 4, 2],
  Lounge:    [3, 2, 0, 2, 2, 3],
};
