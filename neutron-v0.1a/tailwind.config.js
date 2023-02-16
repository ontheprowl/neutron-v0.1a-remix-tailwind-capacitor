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
        'primary-dark': '#4F3A92',
        'primary-base':'#6950ba',
        'primary-light':'#F0EBFF',
        'accent-dark': '#D50D8E',
        'accent-base': '#F670C7',
        'accent-light': '#FFC1E9',
        'neutral-dark':'#6F6E6E',
        'neutral-light':'#DCDCDC',
        'neutral-base':'#BDBCBC',
        'primary-text':'#202020',
        'secondary-text':'#7D7D7D',
        'success-dark':'#1f8c30',
        'success-base':'#24AB39',
        'success-light':'#BAF0C3',

        'white': '#FFFFFF',
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
