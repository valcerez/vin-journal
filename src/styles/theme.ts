export const palette = {
  background: "#12060C",
  surface: "#1F0A14",
  surfaceAlt: "#2B0F1F",
  primary: "#7A1C3A",
  primaryDark: "#4C0D23",
  accent: "#E6B85C",
  text: "#FDF7F0",
  mutedText: "#C7A7B3",
  border: "rgba(255, 255, 255, 0.08)",
  success: "#7BD389",
  warning: "#F4B860",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 6,
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: palette.text,
  },
  subtitle: {
    fontSize: 16,
    color: palette.mutedText,
  },
  body: {
    fontSize: 16,
    color: palette.text,
  },
};
