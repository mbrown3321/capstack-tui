// Color scheme based on the HTML design
export const colors = {
  // Background colors
  bg: '#0d0f0e',
  bg2: '#141816', 
  bg3: '#1c201e',
  
  // Border and UI elements
  border: '#2a312d',
  dim: '#3b4840',
  muted: '#5c7068',
  
  // Text colors
  text: '#c8d8cf',
  textHi: '#e8f2ec',
  
  // Accent colors
  green: '#4ec97c',
  greenDim: '#2a7a4c',
  yellow: '#e8c56a',
  cyan: '#5fd4c0',
  purple: '#a78bfa',
  
  // Special backgrounds
  tagBg: '#1a2e24',
};

// Ink color mappings
export const inkColors = {
  black: colors.bg,
  red: '#ff6b6b',
  green: colors.green,
  yellow: colors.yellow,
  blue: '#4dabf7',
  magenta: colors.purple,
  cyan: colors.cyan,
  white: colors.text,
  gray: colors.muted,
  lightGray: colors.dim,
  darkGray: colors.border,
};

// Layout constants - exact match to HTML design (220px, 1fr, 300px)
export const layout = {
  leftPaneWidth: 22,  // ~220px in terminal chars (10px per char)
  rightPaneWidth: 30, // ~300px in terminal chars (10px per char)
  minWidth: 40,
};

// Text formatting helpers
export const textStyles = {
  title: { bold: true, color: inkColors.green },
  subtitle: { color: inkColors.muted },
  active: { color: inkColors.cyan, bold: true },
  selected: { color: inkColors.textHi },
  dim: { color: inkColors.dim },
  border: { color: inkColors.darkGray },
};
