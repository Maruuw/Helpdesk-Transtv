/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: '#0C3E7E',
          'sidebar-form': '#00346C',
          'primary-form': '#153F85',
          'primary-list': '#193B70',
          accent: '#2563EB',
          navy: '#002B66',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          'page-form': '#E9EDF4',
          'page-dashboard': '#ECF1F7',
          disabled: '#DDE5ED',
        },
        border: {
          field: '#CBD5E1',
          subtle: '#E2E8F0',
        },
        status: {
          'solved-bg': '#E7F7ED',
          'solved-text': '#1C9C4C',
          'progress-bg': '#E7F0FD',
          'progress-text': '#2563EB',
          'waiting-bg': '#FEF5E7',
          'waiting-text': '#C97D0C',
        },
        text: {
          heading: '#0F172A',
          main: '#1E293B',
          secondary: '#64748B',
          placeholder: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '36px',
      },
    },
  },
  plugins: [],
}
