/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        manak: {
          navy: '#1B3A6B',
          darkNavy: '#0F2344',
          shieldBlue: '#244B88',
          orange: '#E8622C',
          green: '#2A9D5C',
          lightBg: '#F5F6F8',
          cardBorder: '#E2E8F0',
          textDark: '#1A1A1A',
          amber: '#B7791F',
          red: '#C0392B'
        }
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
        sans: ['"Public Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 24px rgba(27, 58, 107, 0.12)',
        'nav': '0 -2px 10px rgba(27, 58, 107, 0.08)'
      }
    },
  },
  plugins: [],
}
