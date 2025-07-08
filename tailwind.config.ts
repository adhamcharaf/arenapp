// @ts-nocheck
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ci: {
          green: '#00B04F',
          orange: '#FF8500',
        },
        wave: '#1E40AF',
        sport: {
          padel: '#10B981',
          football: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config;