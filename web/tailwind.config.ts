import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./styles/**/*.{css}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          500: "#34d399",
          600: "#059669",
        },
      },
      backgroundImage: {
        glass: "radial-gradient(circle at top, rgba(52,211,153,0.08), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
