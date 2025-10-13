/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'], // títulos
        sans: ['Inter', 'system-ui', 'sans-serif'], // botones, texto, cuerpo
      },
      colors: {
        bg:   { DEFAULT: '#0b0b1a', soft: '#121227', card: '#151532' }, // fondo oscuro violáceo
        ink:  { 100: '#E7E7FF', 300: '#BEBEE7', 500: '#A7A7DC' },
        // Paleta a partir de tu imagen
        brand: {
          red: '#f2203b',
          purple: '#870a95',
        },
        acc:  { danger: '#FF6B6B', warn: '#FBBF24', success: '#36D399' }
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,.40)',
        glow: '0 0 0 2px rgba(165,76,255,.22), 0 12px 40px rgba(165,76,255,.18)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: .9 }, '50%': { opacity: 1 } },
      },
      animation: {
        'fade-up': 'fade-up .3s ease forwards',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite'
      }
    },
    container: { center: true, padding: '1rem' }
  },
  plugins: [],
}
