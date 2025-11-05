import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        foreground: "#111827",
        primary: "#4b5563",
        "primary-hover": "#374151",
        secondary: "#1f2937",
        accent: "#9ca3af",
        muted: "#e5e7eb",
        border: "#d1d5db",
        card: "#ffffff",
        "card-dark": "#1f2937",
      },
    },
  },
  plugins: [],
} satisfies Config;
