// @ts-nocheck
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'ci-green': '#00B04F',
        'ci-orange': '#FF8500',
        'wave-blue': '#1E40AF',
        'sport-padel': '#10B981',
        'sport-football': '#F59E0B',
      },
    },
  },
  plugins: [],
}

export default config;