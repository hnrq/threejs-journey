/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
