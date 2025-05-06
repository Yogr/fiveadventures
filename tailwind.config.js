/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['VT323', 'monospace'],
      },
      textShadow: {
        DEFAULT: '0 1px 2px rgba(0, 0, 0, 0.5)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.6)',
        md: '0 2px 4px rgba(0, 0, 0, 0.7)',
        lg: '0 2px 6px rgba(0, 0, 0, 0.8)',
        xl: '0 3px 8px rgba(0, 0, 0, 0.9)',
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#3b1583', // Added deeper shade for more contrast options
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        scaleIn: 'scaleIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '80%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 1.0)',
        },
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
        },
        '.text-shadow-md': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-lg': {
          textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
        },
        '.text-shadow-xl': {
          textShadow: '0 3px 8px rgba(0, 0, 0, 0.9)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      };
      addUtilities(newUtilities);
    },
  ],
  future: {
    hoverOnlyWhenSupported: true, // Better touch device support
  },
};

module.exports = config;
