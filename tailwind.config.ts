import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1600px',
    },
    extend: {
      colors: {
        ink: '#08090B',
        charcoal: '#111216',
        graphite: '#1A1B20',
        ivory: '#F1EEE7',
        silver: '#93949A',
        acid: '#D7FF45',
        blood: '#742C35',
        line: 'rgba(241, 238, 231, 0.12)',
        'line-strong': 'rgba(241, 238, 231, 0.22)',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        'display-sm': ['clamp(2.5rem, 7vw, 4.5rem)', { lineHeight: '0.92', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(3rem, 9vw, 7rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-lg': ['clamp(3.25rem, 11.5vw, 11rem)', { lineHeight: '0.84', letterSpacing: '-0.05em' }],
        'display-xl': ['clamp(3.5rem, 14vw, 15rem)', { lineHeight: '0.8', letterSpacing: '-0.055em' }],
      },
      spacing: {
        gutter: 'var(--gutter)',
        nav: 'var(--nav-h)',
      },
      maxWidth: {
        frame: '1680px',
      },
      transitionTimingFunction: {
        cinema: 'cubic-bezier(0.22, 1, 0.36, 1)',
        shutter: 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      aspectRatio: {
        poster: '2 / 3',
        scope: '2.39 / 1',
        wide: '16 / 9',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-4%, 3%)' },
          '40%': { transform: 'translate(3%, -5%)' },
          '60%': { transform: 'translate(-2%, 6%)' },
          '80%': { transform: 'translate(5%, -2%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scroll-cue': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '45%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '55%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
      animation: {
        grain: 'grain 1.2s steps(6) infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'scroll-cue': 'scroll-cue 2.4s cubic-bezier(0.76, 0, 0.24, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
