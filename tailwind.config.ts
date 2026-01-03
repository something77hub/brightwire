import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['"Merriweather Sans"', 'system-ui', 'sans-serif'],
        'serif': ['"Merriweather"', 'Georgia', 'serif'],
      },
      fontSize: {
        'base': ['18px', { lineHeight: '1.75' }],     // Increased from default 16px
        'lg': ['20px', { lineHeight: '1.75' }],       // Larger body text
        'xl': ['22px', { lineHeight: '1.75' }],       // Even larger for emphasis
        '2xl': ['26px', { lineHeight: '1.6' }],       // Headings
        '3xl': ['32px', { lineHeight: '1.5' }],
        '4xl': ['40px', { lineHeight: '1.4' }],
      },
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
