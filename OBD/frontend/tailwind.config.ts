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
        primary: "#0A0F2C",
        accent: "#00C2FF",
        "accent-dark": "#0099CC",
        "accent-glow": "rgba(0,194,255,0.2)",
        "bg-light": "#F5F7FA",
        "bg-card": "#FFFFFF",
        "text-muted": "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0A0F2C 0%, #0D1535 40%, #0A1A3E 70%, #0A0F2C 100%)",
        "accent-gradient":
          "linear-gradient(135deg, #00C2FF 0%, #0099CC 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,194,255,0.05) 100%)",
      },
      boxShadow: {
        "glow-accent": "0 0 30px rgba(0,194,255,0.3)",
        "glow-sm": "0 0 15px rgba(0,194,255,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.08)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.15)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,194,255,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0,194,255,0.6)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
