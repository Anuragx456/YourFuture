export const COLORS = {
  primary: '#E8622E',
  background: {
    light: '#FCEDDF',
    dark: '#1A1A1A',
  },
  card: {
    light: '#DABE87',
    dark: '#1A1A1A',
  },
  surface: {
    light: '#DABE87',
    dark: '#E9E5D8',
  },
  text: {
    light: '#1A1A1A',
    dark: '#FCEDDF',
    mutedLight: '#56564C',
    mutedDark: '#9A9A92',
  },
  accent: '#E8622E',
  border: {
    light: 'rgba(0, 0, 0, 0.06)',
    dark: 'rgba(255, 255, 255, 0.08)',
  },
  placeholder: {
    light: '#6E6E64',
    dark: '#9A9A92',
  },
  status: {
    pending: '#E8B94E',
    success: '#4CAF6D',
    error: '#E8622E',
  },
  avatar: {
    blue: '#3D6FE0',
    green: '#4CAF6D',
  },
};

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
