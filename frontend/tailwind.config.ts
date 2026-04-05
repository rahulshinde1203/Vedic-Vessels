import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f5d9a8',
          300: '#efbd6d',
          400: '#e89a32',
          500: '#d4780f',
          600: '#b85e0a',
          700: '#96460c',
          800: '#7a3910',
          900: '#642f11',
          950: '#3a1705',
        },
        copper: {
          light: '#e8a87c',
          DEFAULT: '#c67c52',
          dark: '#a0522d',
        },
        cream: {
          50: '#fffdf7',
          100: '#fdf8f0',
          200: '#f9f0e0',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(58, 23, 5, 0.08), 0 1px 4px -1px rgba(58, 23, 5, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(58, 23, 5, 0.14), 0 4px 12px -2px rgba(58, 23, 5, 0.08)',
        'nav': '0 1px 0 0 rgba(58, 23, 5, 0.06), 0 4px 16px -4px rgba(58, 23, 5, 0.08)',
        'glow': '0 0 0 3px rgba(232, 154, 50, 0.25)',
      },
      backgroundImage: {
        'copper-gradient': 'linear-gradient(135deg, #b85e0a 0%, #e89a32 50%, #d4780f 100%)',
        'hero-gradient':   'linear-gradient(160deg, #3a1705 0%, #642f11 40%, #96460c 100%)',
        'cream-gradient':  'linear-gradient(180deg, #fdf8f0 0%, #faefd9 100%)',
        'card-shine':      'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease-out both',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'shimmer':     'shimmer 1.8s infinite',
        'slide-down':  'slideDown 0.3s ease-out both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
