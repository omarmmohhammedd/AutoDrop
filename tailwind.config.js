/** @type {import('tailwindcss').Config} */

function customColors(cssVar) {
  return ({ opacityVariable, opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${cssVar}), ${opacityValue})`;
    }
    if (opacityVariable !== undefined) {
      return `rgba(var(${cssVar}), var(${opacityVariable}, 1))`;
    }
    return `rgb(var(${cssVar}))`;
  };
}

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#253439',
        secondary: '#b29e84',
        title: customColors('--c-neutral-800'),
        content: customColors('--c-neutral-600'),
        'sub-title': customColors('--c-neutral-500'),
        'sub-content': customColors('--c-neutral-500'),
        card: customColors('--c-neutral-50'),
        ground: customColors('--c-neutral-100'),
        'ring-border': customColors('--c-neutral-200'),
        'ring-border': customColors('--c-neutral-200'),
        neutral: {
          50: customColors('--c-neutral-50'),
          100: customColors('--c-neutral-100'),
          200: customColors('--c-neutral-200'),
          300: customColors('--c-neutral-300'),
          400: customColors('--c-neutral-400'),
          500: customColors('--c-neutral-500'),
          600: customColors('--c-neutral-600'),
          700: customColors('--c-neutral-700'),
          800: customColors('--c-neutral-800'),
          900: customColors('--c-neutral-900')
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ]
};

