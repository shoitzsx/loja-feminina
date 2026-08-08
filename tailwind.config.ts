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
          50: "#fff0f8",
          100: "#ffd7ec",
          200: "#ffadd8",
          300: "#ff78bd",
          400: "#ff3f9f",
          500: "#ff1689",
          600: "#e60077",
          700: "#bd0064",
          800: "#940650",
          900: "#6f0a42"
        },
        champagne: "#d8a83d",
        ink: "#24101d",
        plum: "#5a1238",
        blush: "#fff4fa"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(230, 0, 119, 0.16)",
        card: "0 14px 34px rgba(189, 0, 100, 0.12)",
        glow: "0 18px 45px rgba(255, 22, 137, 0.28)"
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
