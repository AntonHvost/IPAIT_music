/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme:{
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      delft_blue: {
        DEFAULT: '#26334d',
        light: '#56AEFF',
      },
      oxford_blue:{
        DEFAULT: '#101935',
      },
      antiflash_white:'#EDF2F4',
      pink: '#FC8BFD',
      
    },
  },
};
