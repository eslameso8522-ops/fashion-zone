import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        rosegold: {
          50: "#faf5f5",
          100: "#f4e9e7",
          200: "#ebd8d5",
          300: "#dcbfba",
          400: "#c79e97",
          500: "#b76e79",
          600: "#a35864",
          700: "#884450",
        },
        creamy: {
          50: "#fdfbf9",
          100: "#f9f6f0",
          200: "#f3ede2",
        }
      },
      fontFamily: {
        sans: ["Cairo", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Cairo", "serif"],
      },
      boxShadow: {
        'soft-pink': '0 10px 30px -5px rgba(244, 63, 94, 0.15)',
        'rose-glow': '0 4px 20px rgba(183, 110, 121, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;
