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
        info: mau("--info"),
        grape: mau("--grape")
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        field: "12px",
        card: "20px",
        panel: "26px"
      },
      boxShadow: {
        paper: "0 1px 2px rgb(var(--ink) / 0.05), 0 8px 24px -16px rgb(var(--ink) / 0.18)",
        lift: "0 2px 6px rgb(var(--ink) / 0.06), 0 28px 60px -28px rgb(var(--ink) / 0.32)",
        stamp: "0 0 0 3px rgb(var(--accent) / 0.16)"
      },
      transitionTimingFunction: {
        chuan: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
export default config;