/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "h-sm": { raw: "(min-height: 640px)" },
        "h-md": { raw: "(min-height: 768px)" },
        "h-lg": { raw: "(min-height: 1024px)" },
        "h-xl": { raw: "(min-height: 1280px)" },
        "h-2xl": { raw: "(min-height: 1536px)" },
        landscape: { raw: "(orientation: landscape)" },
        portrait: { raw: "(orientation: portrait)" },
      },
      fontSize: {
        // Fluid text typography
        "fluid-sm": "clamp(0.875rem, 1.5vw, 1rem)", // 14px → 16px
        "fluid-md": "clamp(1rem, 2vw, 1.25rem)", // 16px → 20px
        "fluid-lg": "clamp(1.25rem, 3vw, 1.5rem)", // 20px → 24px
        "fluid-xl": "clamp(1.5rem, 4vw, 2rem)", // 24px → 32px
        "fluid-2xl": "clamp(2rem, 5vw, 3rem)", // 32px → 48px
        "fluid-3xl": "clamp(3rem, 6vw, 4rem)", // 48px → 64px
      },
    },
  },
  plugins: [typography, forms, aspectRatio],
};

export default config;
