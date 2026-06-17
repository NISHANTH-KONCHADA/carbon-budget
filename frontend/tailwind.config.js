/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Carbon Budget" palette — a measurement/field-notebook feel
        // rather than a generic eco-green-on-white template.
        canvas: '#F5F7F5',
        ink: '#16241F',
        primary: {
          DEFAULT: '#0F4C42',
          dark: '#0A332C',
          light: '#1F6E5F',
        },
        amber: {
          DEFAULT: '#F2A93C',
          dark: '#D98E1F',
        },
        alert: {
          DEFAULT: '#D6502A',
          light: '#F4D9CD',
        },
        slate: {
          DEFAULT: '#5B7C99',
        },
        line: '#DDE3DC',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
