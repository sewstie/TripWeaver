/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        subbackground: 'var(--subbackground)',
        field: 'var(--field)',
        border: 'var(--border)',
        text: 'var(--text)',
        focus: 'var(--focus)',
        green: 'var(--green)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      }
    },
    fontFamily: {
      poppins: ['var(--font-poppins)'],
      nunito: ['var(--font-nunito)'],
    },
  },
  plugins: [],
}
