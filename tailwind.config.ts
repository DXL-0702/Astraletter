import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Product tokens -------------------------------------------
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          highlight: "var(--surface-highlight)",
        },
        "border-strong": "var(--border-strong)",
        starlight: {
          DEFAULT: "var(--starlight)",
          hover: "var(--starlight-hover)",
        },
        magic: "var(--magic)",
        stellar: "var(--stellar)",
        danger: "var(--danger)",
        success: "var(--success)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      fontSize: {
        display: [
          "var(--text-display)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        float: "var(--shadow-float)",
        glow: "var(--glow-starlight)",
        "glow-starlight": "var(--glow-starlight)",
        "glow-primary": "var(--glow-primary)",
        "glow-magic": "var(--glow-magic)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      zIndex: {
        canvas: "var(--z-canvas)",
        "canvas-label": "var(--z-canvas-label)",
        ui: "var(--z-ui)",
        panel: "var(--z-panel)",
        modal: "var(--z-modal)",
        tooltip: "var(--z-tooltip)",
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "var(--star-opacity, 0.6)" },
          "50%": { opacity: "0.15" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
