/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        backgroundSecondary: "#FAFAFE",
        text: "#1E1B4B",
        textSecondary: "#4338CA",
        textMuted: "#6B7280",
        primary: "#8B5CF6",
        primaryDark: "#7C3AED",
        primaryLight: "#A78BFA",
        primaryForeground: "#FFFFFF",
        card: "#FFFFFF",
        cardForeground: "#1E1B4B",
        border: "#E5E7EB",
        input: "#F9FAFB",
        ring: "#8B5CF6",
        muted: "#F3F4F6",
        mutedForeground: "#6B7280",
        secondary: "#EDE9FE",
        secondaryForeground: "#5B21B6",
        accent: "#F5F3FF",
        accentForeground: "#5B21B6",
        destructive: "#EF4444",
        destructiveForeground: "#FFFFFF",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        white: "#FFFFFF",
        black: "#000000",
        gold: "#F59E0B",
      },
      fontFamily: {
        nexaHeavy: ["Nexa-Heavy"],
        nexaExtraLight: ["Nexa-ExtraLight"],
      },
    },
  },
  plugins: [],
};