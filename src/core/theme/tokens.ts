export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const typography = {
  fonts: {
    sans: "Manrope_400Regular",
    sansLight: "Manrope_300Light",
    sansMedium: "Manrope_500Medium",
    sansSemibold: "Manrope_600SemiBold",
    sansBold: "Manrope_700Bold",
    sansExtraBold: "Manrope_800ExtraBold",
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;
