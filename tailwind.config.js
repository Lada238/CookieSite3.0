// Конфиг Tailwind: палитра «бордо · сирень · розовый · персик · дымчато-голубой», тёмная тема, анимация, плагин с кастомной утилитой
tailwind.config = {
  darkMode: 'class',
  theme: { extend: {
    colors: {
      brand: { 50: '#fbf1f5', 100: '#f4e0e9', 200: '#ead0df', 300: '#d8b4cc', 400: '#bf8fae', 500: '#a4708f', 600: '#86405c', 700: '#7a3048', 800: '#5e2437', 900: '#43192a' },
      peach: { 100: '#fdf5f0', 200: '#f3dfd6', 300: '#e8cbbf', 700: '#8a5a48' },
      mist:  { 100: '#eef3f5', 200: '#c8d6db', 300: '#a8bcc4', 700: '#4d6670' },
      slate: { 50: '#fdfbfb', 100: '#f7f2f4', 200: '#ece2e6', 300: '#d9cbd1', 400: '#b8a3ac', 500: '#927b85', 600: '#705c66', 700: '#523f48', 800: '#3b2a33', 900: '#2b1d24', 950: '#1e1318' },
      success: '#5f8a8f', warning: '#c78d62', danger: '#a23a52', info: '#6f93a3' },
    keyframes: { fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } } },
    animation: { 'fade-up': 'fadeUp .8s ease-out both' }
  } },
  plugins: [ function ({ addUtilities }) {
    addUtilities({ '.scrollbar-thin': { 'scrollbar-width': 'thin' } });   // своя утилита scrollbar-thin
  } ]
};