import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#6841ea',
          700: '#5b35d4',
          800: '#4c28b5',
          900: '#3f2294',
        },
        surface: {
          main: 'rgb(249, 250, 251)',
          sidebar: 'rgb(255, 255, 255)',
          card: 'rgb(255, 255, 255)',
          hover: 'rgb(245, 245, 245)',
        },
        text: {
          primary: 'rgb(38, 38, 38)',
          secondary: 'rgb(134, 134, 146)',
        },
        border: {
          light: 'rgba(79, 89, 102, 0.08)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'card': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
