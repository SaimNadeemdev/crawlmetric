/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ['Poppins', 'var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      fsme: ['FS Me', 'var(--font-fs-me)', 'sans-serif'],
      poppins: ['Poppins', 'var(--font-poppins)', 'sans-serif'],
      logo: ['var(--font-lil-grotesk)', 'sans-serif'],
      hero: ['var(--font-pacifico)', 'cursive'],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "progress-bar": {
          "0%": { opacity: 0.7 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0.7 }
        },
        "pulse-subtle": {
          "0%": { opacity: 0.8 },
          "50%": { opacity: 1 },
          "100%": { opacity: 0.8 }
        },
        "circle-load": {
          "0%": { strokeDashoffset: "113.1" },
          "100%": { strokeDashoffset: "var(--final-offset)" }
        },
        "bar-load": {
          "0%": { width: "0%" },
          "100%": { width: "var(--final-width)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "progress-bar": "progress-bar 2s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "circle-load": "circle-load 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "bar-load": "bar-load 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
