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
          DEFAULT: '#8B5E34', // Rich Teak/Sheesham Wood
          hover: '#6E4522',   // Deep Walnut Wood
        },
        secondary: {
          DEFAULT: '#C89B6D', // Warm Oak / Honey Wood
          hover: '#A87A4F',
        },
        wood: {
          light: '#F5EDE4',
          sand: '#EADBCE',
          teak: '#8B5E34',
          walnut: '#5C3A21',
          dark: '#3D2514',
        },
        accent: '#5F7D4A',     // Organic Sage Green (complements warm timber)
        background: '#FAF6F0', // Warm Alabaster/Cream background
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F4ECE1',      // Soft birch/cream surface
        },
        'text-main': '#2C2016', // Deep espresso brown text
        'text-muted': '#7A6453',// Warm cedar muted text
        border: '#E8DED1',     // Soft warm wood-tone border (no harsh cold gray)
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
