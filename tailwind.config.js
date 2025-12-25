/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        bold: ['Inter_700Bold', 'System'],
        black: ['Inter_900Black', 'System'],
      },
      colors: {
        swiss: {
          red: '#FF3B30',
          black: '#000000',
          white: '#FFFFFF',
          gray: '#F2F2F7',
        }
      }
    },
  },
  plugins: [],
};
