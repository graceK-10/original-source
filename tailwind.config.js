/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gothic: ['GothicCondensed', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
     colors: {
  primary: "#08B2B2",        // main bright teal
  secondary: "#33C4C4",      // lighter teal accent
  tertiary: "#028282",       // dark teal (replaces deep purple)
  fourthColor: "#046A6A",    // deeper teal shadow tone
  bgColor: "#08B2B280",      // translucent background (replaces purple bg tint)
  brandPurple: "#028282",    // renamed but kept key for backward compatibility
  brandBeige: "#f1f1f1",     // unchanged
  brandGold: "#FDBA21",      // unchanged
},

      container: {
        center: true,
        padding: {
          default: "2rem",
          sm: "1rem",
        },
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
  ],
}

