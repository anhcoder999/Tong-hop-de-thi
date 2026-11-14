import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
// Bảng màu thương hiệu: gradient xanh dương #3B82F6 → #1E40AF, font Inter qua biến CSS
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(15, 23, 42, 0.06)",
        lift: "0 12px 32px rgba(59, 130, 246, 0.18)",
        glow: "0 0 0 3px rgba(59, 130, 246, 0.25)",
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