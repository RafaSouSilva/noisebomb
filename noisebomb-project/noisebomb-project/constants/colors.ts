/**
 * NoiseBomb cyberpunk / dark-mode palette.
 * Deep graphite blacks with electric purple, neon cyan and lime-green accents.
 */

const palette = {
  background: "#08080d",
  surface: "#101019",
  surfaceElevated: "#16162280",
  card: "#13131f",
  cardBorder: "#23233a",

  text: "#f4f4ff",
  textMuted: "#8a8aa8",
  textFaint: "#5a5a78",

  purple: "#b026ff",
  purpleDim: "#7a1bb0",
  cyan: "#00e5ff",
  lime: "#aaff00",
  pink: "#ff2d95",

  danger: "#ff3366",
  gold: "#ffcc00",
};

const colors = {
  light: {
    text: palette.text,
    tint: palette.purple,

    background: palette.background,
    foreground: palette.text,

    card: palette.card,
    cardForeground: palette.text,

    primary: palette.purple,
    primaryForeground: "#ffffff",

    secondary: palette.surface,
    secondaryForeground: palette.text,

    muted: palette.surface,
    mutedForeground: palette.textMuted,

    accent: palette.cyan,
    accentForeground: "#001014",

    destructive: palette.danger,
    destructiveForeground: "#ffffff",

    border: palette.cardBorder,
    input: palette.cardBorder,
  },

  dark: {
    text: palette.text,
    tint: palette.purple,

    background: palette.background,
    foreground: palette.text,

    card: palette.card,
    cardForeground: palette.text,

    primary: palette.purple,
    primaryForeground: "#ffffff",

    secondary: palette.surface,
    secondaryForeground: palette.text,

    muted: palette.surface,
    mutedForeground: palette.textMuted,

    accent: palette.cyan,
    accentForeground: "#001014",

    destructive: palette.danger,
    destructiveForeground: "#ffffff",

    border: palette.cardBorder,
    input: palette.cardBorder,
  },

  radius: 18,
};

export const neon = palette;
export default colors;
