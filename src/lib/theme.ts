import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

export interface AppTheme {
  isDark: boolean;
  /** Brand accent. Orange by default, or the user's chosen color. */
  accent: string;
  /** Text/icon color that sits on top of an accent fill. */
  onAccent: string;
  /** Screen background. Charcoal in dark, cream in light. */
  screenBg: string;
  /** Card surface. Uses the background color for the active theme. */
  card: string;
  /** Slightly toned surface for nested or alternate blocks. */
  cardAlt: string;
  /** Primary text inside cards (always ink — cards are light in both modes). */
  text: string;
  /** Primary text placed directly on the screen background. */
  textOnBg: string;
  /** Muted text inside cards. */
  muted: string;
  /** Muted text placed directly on the screen background. */
  mutedOnBg: string;
  /** Hairline border used inside cards. */
  border: string;
  /** Hairline border used directly on the screen background. */
  borderOnBg: string;
  /** Track color for progress rings / bars. */
  track: string;
  /** Translucent wash of the accent. */
  accentSoft: string;
  status: {
    pending: string;
    success: string;
    error: string;
  };
  radii: {
    card: number;
    md: number;
    sm: number;
    pill: number;
  };
}

function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}

export function useAppTheme(): AppTheme {
  const { profile } = useUserStore();
  const isDark = profile.theme === 'dark';
  const accent = profile.primaryColor || COLORS.primary;

  return {
    isDark,
    accent,
    onAccent: '#FFFFFF',
    screenBg: isDark ? COLORS.background.dark : COLORS.background.light,
    card: isDark ? COLORS.background.dark : COLORS.background.light,
    cardAlt: isDark ? '#242424' : '#FCD8B7',
    text: isDark ? COLORS.text.dark : COLORS.text.light,
    textOnBg: isDark ? COLORS.text.dark : COLORS.text.light,
    muted: isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight,
    mutedOnBg: isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight,
    border: isDark ? COLORS.border.dark : COLORS.border.light,
    borderOnBg: isDark ? COLORS.border.dark : COLORS.border.light,
    track: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
    accentSoft: withAlpha(accent, isDark ? '26' : '1F'),
    status: {
      pending: COLORS.status.pending,
      success: COLORS.status.success,
      error: COLORS.status.error,
    },
    radii: {
      card: 22,
      md: 14,
      sm: 10,
      pill: 999,
    },
  };
}
