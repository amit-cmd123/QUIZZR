/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          purple: '#7C3AED',
          pink: '#EC4899',
          cyan: '#06B6D4',
          success: '#22C55E',
          warning: '#FBBF24',
          danger: '#EF4444',
          darkBg: '#0B1020',
          cardBg: '#111827',
          surface: '#1F2937',
          textPri: '#F8FAFC',
          textSec: '#9CA3AF',
        }
      },
      backgroundImage: {
        'halftone': "url('/src/assets/halftone.png')",
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
