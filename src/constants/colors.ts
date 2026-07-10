export const COLORS = {
  primary: '#8b5cf6', // Violet 500
  secondary: '#ec4899', // Pink 500
  background: {
    light: '#f8fafc',
    dark: '#090514', // Premium Cosmic Deep Purple-Black
  },
  card: {
    light: '#ffffff',
    dark: '#130c2c', // Translucent deep purple card background
  },
  text: {
    light: '#0f172a',
    dark: '#f8fafc',
    mutedLight: '#64748b',
    mutedDark: '#94a3b8',
  },
  accent: '#a78bfa',
  border: {
    light: 'rgba(0, 0, 0, 0.06)',
    dark: 'rgba(255, 255, 255, 0.08)',
  },
  gradients: {
    primary: ['#8b5cf6', '#ec4899'], // Violet to Pink (AI / Future theme)
    space: ['#090514', '#02000a'], // Deep space
    glass: ['rgba(30, 41, 59, 0.4)', 'rgba(30, 41, 59, 0.2)'],
    lightGlass: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'],
  }
};

// Returns a darker shade of a hex color (factor 0..1 = remaining brightness).
// Used to tint dark-mode backgrounds with the user's selected accent.
export function tintedDark(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const f = Math.max(0, Math.min(1, factor));
  const toHex = (v: number) => Math.round(v * f).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

