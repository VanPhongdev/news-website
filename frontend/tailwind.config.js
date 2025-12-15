export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#1a56db', // Navy blue - professional and trustworthy
        'primary-dark': '#1e429f', // Darker navy for hover states
        'background-light': '#ffffff', // Pure white for clean look
        'background-dark': '#0f172a', // Deep slate for dark mode
        'surface-light': '#f8fafc', // Very light gray for cards
        'surface-dark': '#1e293b', // Slate for dark mode cards
        'text-primary': '#0f172a', // Almost black for main text
        'text-secondary': '#64748b', // Slate gray for secondary text
        'border-light': '#e2e8f0', // Light border
        'border-dark': '#334155', // Dark mode border
      },
      fontFamily: {
        'display': ['Newsreader', 'serif'],
        'sans': ['Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
