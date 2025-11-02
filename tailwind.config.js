/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'dana': ['var(--font-dana)', 'Dana', 'Tahoma', 'Arial', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'Poppins', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  variants: {
    extend: {
      display: ['print'],
      visibility: ['print'],
      opacity: ['print'],
      backgroundColor: ['print'],
      textColor: ['print'],
      borderColor: ['print'],
      boxShadow: ['print'],
      borderRadius: ['print'],
    },
  },
}
