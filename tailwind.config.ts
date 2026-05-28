import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2050',
          light: '#1E3A6E',
          dark: '#0A1535',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#F0D080',
          dark: '#A07830',
        },
        teal: {
          preview: '#1A5B6A',
        },
        cream: '#F5EDE0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
