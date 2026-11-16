import type {Config} from "tailwindcss";
const mau = (v: string) => `rgb(var(${v}) / <alpha-value>)`;
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {DEFAULT: mau("--ink"), soft: mau("--ink-soft"), faint: mau("--ink-faint")},
        paper: {DEFAULT: mau("--paper"), light: mau("--paper-light"), deep: mau("--paper-deep")},
        accent: {DEFAULT: mau("--accent"), deep: mau("--accent-deep"), wash: mau("--accent-wash")},
        ok: mau("--ok"),
        warn: mau("--warn"),
        danger: mau("--danger"),
        info: mau("--info")
      },
      fontFamily: {
        display: ["var(--font-lora)", "serif"],
        sans: ["var(--font-be)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        paper: "0 1px 0 rgb(var(--ink) / 0.08), 0 10px 28px -14px rgb(var(--ink) / 0.28)",
        lift: "0 2px 0 rgb(var(--ink) / 0.1), 0 24px 60px -24px rgb(var(--ink) / 0.45)",
        stamp: "2px 2px 0 rgb(var(--accent) / 0.35)"
      }
    }
  },
  plugins: []
};
export default config;