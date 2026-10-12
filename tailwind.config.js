/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5E34',
          hover: '#5C3A21',
        },
        secondary: {
          DEFAULT: '#C89B6D',
          hover: '#A67B51',
        },
        accent: '#5F7D4A',
        background: '#FFF8ED',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F3E5D0',
        },
        'text-main': '#2B2118',
        'text-muted': '#6B5542',
        border: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 94, 52, 0.3)',
      },
    },
  },
  plugins: [],
}
