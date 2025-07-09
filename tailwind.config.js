/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#B8E6FF',
          'blue-light': '#E3F4FF',
          'blue-dark': '#7DD3FC',
          orange: '#FFD4B8',
          'orange-light': '#FFE8D6',
          'orange-dark': '#FFA366',
          grey: '#E5E7EB',
          'grey-light': '#F3F4F6',
          'grey-dark': '#D1D5DB',
          lemon: '#FFFACD',
          'lemon-light': '#FFFDE7',
          'lemon-dark': '#FFF59D',
          green: '#C8E6C9',
          'green-light': '#E8F5E8',
          'green-dark': '#A5D6A7',
          purple: '#E1BEE7',
          'purple-light': '#F3E5F5',
          'purple-dark': '#CE93D8',
          pink: '#F8BBD9',
          'pink-light': '#FCE4EC',
          'pink-dark': '#F48FB1'
        }
      }
    },
  },
  plugins: [],
};