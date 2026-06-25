/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charlie: {
          amber: '#C47A1A',
          amber2: '#E89A2A',
          forest: '#2D5016',
          forest2: '#4A8022',
          cream: '#FAFAF7',
          ink: '#1C1C18',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
