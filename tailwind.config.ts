import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        ink: {
          50: "#f5f4f0",
          100: "#e8e5dc",
          200: "#d0ccc0",
          300: "#b0a99a",
          400: "#8c8373",
          500: "#6e6456",
          600: "#584e43",
          700: "#463e35",
          800: "#29241e",
          900: "#1a1610",
          950: "#0e0c08",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
        sky: {
          400: "#38bdf8",
          500: "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
