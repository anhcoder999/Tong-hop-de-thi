import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#F3EDE2", light: "#FAF6EC", deep: "#E9E0CE", line: "#D8CDB6" },
        ink: { DEFAULT: "#211D18", soft: "#5C554A", faint: "#8A8172" },
        accent: { DEFAULT: "#A8231C", deep: "#7C150F", wash: "#F3E0DA" },
      },
      fontFamily: {
        display: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-be)", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        paper: "0 1px 0 rgba(33,29,24,0.08), 0 2px 6px rgba(33,29,24,0.06)",
        lift: "8px 10px 0 rgba(33,29,24,0.12)",
        stamp: "2px 2px 0 rgba(168,35,28,0.25)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
export default config;