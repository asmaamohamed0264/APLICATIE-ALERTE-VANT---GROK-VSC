/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1d29',
        'bg-secondary': '#2a2d3a',
        'bg-tertiary': '#374151',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'border-color': '#374151',
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-yellow': '#f59e0b',
        'accent-orange': '#f97316',
        'accent-red': '#ef4444',
        'accent-purple': '#8b5cf6',
      },
    },
  },
  plugins: [],
}