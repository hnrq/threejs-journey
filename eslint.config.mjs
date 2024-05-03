// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [
      "/dist/**",
      "node_modules/",
      "vite.config.ts",
      "public/draco/",
    ],
    languageOptions: {
      globals: {
        browser: true,
        esnext: true,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // "import/order": [
      //   "error",
      //   {
      //     groups: ["builtin", "external", "internal"],
      //     pathGroups: [
      //       {
      //         pattern: "astro",
      //         group: "external",
      //         position: "before",
      //       },
      //       {
      //         pattern: "three",
      //         group: "external",
      //         position: "before",
      //       },
      //     ],
      //     pathGroupsExcludedImportTypes: ["astro"],
      //     "newlines-between": "always",
      //     alphabetize: {
      //       order: "asc",
      //       caseInsensitive: true,
      //     },
      //   },
      // ],
      "@typescript-eslint/triple-slash-reference": "off",
      "no-shadow": "error",
      "no-underscore-dangle": ["error", { "allow": ["__typename"] }],
      "no-unused-vars": [
        "error",
        { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" },
      ],
      "no-use-before-define": ["error"],
    },
  }
);