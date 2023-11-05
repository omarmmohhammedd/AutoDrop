/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*{.ejs,.html}", "./public/**/*{.ejs,.html}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
