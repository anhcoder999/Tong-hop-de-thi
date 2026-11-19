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
        mark: {DEFAULT: mau("--mark"), ink: mau("--mark-ink")},
        ok: mau("--ok"),
        warn: mau("--warn"),
        danger: mau("--danger"),
        info: mau("--info"),
        grape: mau("--grape"),
        cyan: mau("--cyan")
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        field: "10px",
        card: "14px",
        panel: "22px"
      },
      boxShadow: {
        paper: "0 1px 0 rgb(var(--ink) / 0.05), 3px 3px 0 rgb(var(--ink) / 0.07)",
        lift: "6px 6px 0 rgb(var(--ink) / 0.10), 0 22px 44px -28px rgb(var(--ink) / 0.55)",
        stamp: "0 0 0 3px rgb(var(--mark) / 0.6)"
      },
      transitionTimingFunction: {
        chuan: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
export default config;