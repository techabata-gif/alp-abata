import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10221d",
        leaf: "#0f7a5b",
        mint: "#dff6ea",
        sun: "#f5b744",
        clay: "#a35f3b",
        cloud: "#f7faf8"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(16, 34, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
