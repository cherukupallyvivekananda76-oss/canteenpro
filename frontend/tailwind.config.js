/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          start: '#020617',
          end: '#020817',
        },
        primary: {
          DEFAULT: '#f97316',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
        secondary: {
          DEFAULT: '#ec4899',
          glow: 'rgba(236, 72, 153, 0.4)',
        },
        accent: {
          DEFAULT: '#22c55e',
          glow: 'rgba(34, 197, 94, 0.4)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
