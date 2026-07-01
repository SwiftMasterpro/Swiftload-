import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#080E1A',
          navyMid: '#0D1628',
          card:    '#0E1825',
          amber:   '#F59E0B',
          hot:     '#F47920',
          green:   '#10B981',
          red:     '#EF4444',
          blue:    '#3B82F6',
          mist:    '#94A3B8',
          ink:     '#64748B',
          slate:   '#CBD5E1',
        },
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        body:    ['var(--font-inter)',   'sans-serif'],
      },
      animation: {
        'reveal':   'reveal 480ms cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-l':  'slideL 480ms cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-r':  'slideR 480ms cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':  'fadeIn 350ms ease-out forwards',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        reveal:     { from:{ opacity:'0', transform:'translateY(22px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideL:     { from:{ opacity:'0', transform:'translateX(-28px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        slideR:     { from:{ opacity:'0', transform:'translateX(28px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        fadeIn:     { from:{ opacity:'0' }, to:{ opacity:'1' } },
        pulseSoft:  { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'.55' } },
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
export default config
