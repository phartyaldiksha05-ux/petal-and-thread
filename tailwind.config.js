/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F0E9',
        blush: '#E9C9C8',
        'blush-light': '#F6E8E7',
        'blush-deep': '#DCACB0',
        rose: '#B77B83',
        'rose-dark': '#8A4F58',
        'rose-light': '#F4E3E2',
        sage: '#A9B39A',
        'sage-dark': '#6F7B5E',
        'sage-light': '#E8ECE2',
        brown: '#72574C',
        'brown-dark': '#48342D',
        'brown-light': '#9B8176',
        cream: '#FFFCF8',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Poppins"', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(114, 87, 76, 0.08)',
        'soft-lg': '0 20px 40px -15px rgba(114, 87, 76, 0.12)',
        'delicate': '0 4px 20px -2px rgba(183, 123, 131, 0.15)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
