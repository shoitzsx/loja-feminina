import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        rosebrand: {
          50: "rgb(var(--rb-50) / <alpha-value>)",
          100: "rgb(var(--rb-100) / <alpha-value>)",
          200: "rgb(var(--rb-200) / <alpha-value>)",
          300: "rgb(var(--rb-300) / <alpha-value>)",
          400: "rgb(var(--rb-400) / <alpha-value>)",
          500: "rgb(var(--rb-500) / <alpha-value>)",
          600: "rgb(var(--rb-600) / <alpha-value>)",
          700: "rgb(var(--rb-700) / <alpha-value>)",
          800: "rgb(var(--rb-800) / <alpha-value>)",
          900: "rgb(var(--rb-900) / <alpha-value>)"
        },
        champagne: "rgb(var(--gold) / <alpha-value>)",
        ink: "rgb(var(--text) / <alpha-value>)",
        plum: "rgb(var(--plum) / <alpha-value>)",
        blush: "rgb(var(--blush) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)"
        },
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)"
      },
      animation: {
        "rise-in": "riseIn .65s ease both",
        "soft-pop": "softPop .45s ease both",
        "pink-sheen": "pinkSheen 3.4s ease-in-out infinite"
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        softPop: {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        pinkSheen: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
