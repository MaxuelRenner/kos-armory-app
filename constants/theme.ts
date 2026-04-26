export const Colors = {
  // Core backgrounds
  bg: {
    deep: '#0A0B0D',
    base: '#0F1114',
    elevated: '#161A1F',
    card: '#1C2128',
    input: '#13171C',
    overlay: 'rgba(0,0,0,0.75)',
  },

  // Borders
  border: {
    subtle: '#252C35',
    default: '#2E3844',
    strong: '#3D4F61',
    accent: '#4A6080',
  },

  // Text
  text: {
    primary: '#E8EDF2',
    secondary: '#8A9BB0',
    muted: '#4E606E',
    inverse: '#0A0B0D',
    accent: '#C5D8F0',
  },

  // Status / KOS health
  status: {
    good: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.35)',
      text: '#4ADE80',
      dot: '#22C55E',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      text: '#FCD34D',
      dot: '#F59E0B',
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      text: '#F87171',
      dot: '#EF4444',
    },
  },

  // Accent
  accent: {
    steel: '#4A7FA5',
    steelLight: '#6EA8D0',
    steelDim: 'rgba(74, 127, 165, 0.15)',
    amber: '#D97706',
    amberLight: '#F59E0B',
  },

  // Gun type colors
  type: {
    handgun: '#5B8FB9',
    rifle: '#6B8F6E',
    shotgun: '#9E7240',
    other: '#7B6BA0',
  },
};

export const Fonts = {
  // Use system fonts to avoid native font loading complexity
  mono: 'Courier New',
  heading: 'System',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
};
