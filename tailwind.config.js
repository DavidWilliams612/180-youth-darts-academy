export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    colors: {
      brand: "var(--color-brand)",
      "brand-light": "var(--color-brand-light)",
      "brand-accent": "var(--color-brand-accent)",
      "brand-muted": "var(--color-brand-muted)",
      "brand-soft": "var(--color-brand-soft)",
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
    },

    boxShadow: {
      card: "var(--shadow-card)",
      soft: "var(--shadow-soft)",
    },

    borderRadius: {
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
    },

    transitionTimingFunction: {
      smooth: "var(--transition-smooth)",
    },

    fontSize: {
      title: [
        "var(--font-title-size)",
        {
          lineHeight: "var(--font-title-line)",
          fontWeight: "var(--font-title-weight)",
        },
      ],
      display: [
        "var(--font-display-size)",
        {
          lineHeight: "var(--font-display-line)",
          fontWeight: "var(--font-display-weight)",
        },
      ],
    },

    extend: {
      keyframes: {
        pulseGlow: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0.7" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        fadeIn: "fadeIn 1.2s ease-out forwards",
      },
    },
  },

  plugins: [],
};
