/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-accent': '#333333', 
        'primary-color': '#e9bd20', 
        'primary-color-light': '#ffdf98', 
        'primary-color-dark': '#e9bd2055', 
        'secondary-color': '#cc872e', 
        'secondary-color-dark': '#cc872e55', 
        'success-color': '#28a745',
        'danger-color': '#dc3545',
      },
      borderColor: {
        'default': '#333333', 
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}

