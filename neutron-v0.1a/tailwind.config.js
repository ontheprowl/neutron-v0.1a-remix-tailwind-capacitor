module.exports = {
  mode: 'jit',
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  darkMode: 'class',
  theme: {


    extend: {
      transitionProperty: {
        'height': 'height'
      },

      fontFamily: {
        'gilroy-regular': ['Gilroy-Regular'],
        'gilroy-bold': ['Gilroy-Bold'],
        'gilroy-light': ['Gilroy-Light'],
        'gilroy-black':['Gilroy-Black'],
        'gilroy-medium':['Gilroy-Medium']

      },


      backgroundImage: {
        'gold': `url('/src/assets/images/gold.png')`
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'bg-primary-dark': '#2E2E2E',
        'bg-secondary-dark': '#202020',
        'secondary-dark': '#F5EBFF',
        'accent-dark': '#D4AF37',
        'white': '#FFFFFF',
        'text-dark': '#2E2E2E',
        'overlay-dark': '#5C5C5C',
        'divider-dark': '#EBD7FF',
        'bg-primary-light': '#F5F0E3',
        'bg-secondary-light': '#FFFFFF',
        'secondary-light': '#573BB2',
        'accent-light': '#D4AF37',
        'white': '#FFFFFF',
        'text-light': '#2E2E2E',
        'overlay-light': '#5C5C5C',
        'divider-light': '#EBD7FF',
      },
      screens: {
        'mobile': '320px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
};
