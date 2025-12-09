import { Platform } from "react-native";

const primaryColor = "#6C5CE7";
const primaryDark = "#5B4BC4";
const primaryLight = "#A29BFE";

export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#687076",
    textTertiary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
    link: primaryColor,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F2F2F2",
    backgroundSecondary: "#E6E6E6",
    backgroundTertiary: "#D9D9D9",
    primary: primaryColor,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    upvote: "#00B894",
    downvote: "#FF7675",
    surface: "#F5F5F5",
    surfaceLight: "#EBEBEB",
    categoryConfession: "#FF6B9D",
    categoryCrush: "#FF3E4D",
    categoryMeme: "#FFA502",
    categoryRant: "#A29BFE",
    categoryCompliment: "#00D2D3",
    border: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    textTertiary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryLight,
    link: primaryLight,
    backgroundRoot: "#0D0D0D",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#2D2D2D",
    backgroundTertiary: "#404040",
    primary: primaryColor,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    upvote: "#00B894",
    downvote: "#FF7675",
    surface: "#1A1A1A",
    surfaceLight: "#2D2D2D",
    categoryConfession: "#FF6B9D",
    categoryCrush: "#FF3E4D",
    categoryMeme: "#FFA502",
    categoryRant: "#A29BFE",
    categoryCompliment: "#00D2D3",
    border: "#333333",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const CategoryColors: Record<string, string> = {
  confession: "#FF6B9D",
  crush: "#FF3E4D",
  meme: "#FFA502",
  rant: "#A29BFE",
  compliment: "#00D2D3",
};
