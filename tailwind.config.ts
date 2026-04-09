import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#ebf4ff",
        mist: "#0a111d",
        coral: "#4ea7ff",
        aqua: "#7cc4ff",
        gold: "#1b4b8c",
        night: "#060b13",
        panel: "#0f1726",
        steel: "#8fa3bf",
        line: "rgba(124, 196, 255, 0.16)",
      },
      boxShadow: {
        panel: "0 30px 90px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(124,196,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,196,255,0.08) 1px, transparent 1px)",
      },
      animation: {
        pulseglow: "pulseglow 2s ease-in-out infinite",
        floatup: "floatup 0.8s ease-out both",
      },
      keyframes: {
        pulseglow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        floatup: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
