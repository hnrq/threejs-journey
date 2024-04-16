export default {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "extensions": [".ts", ".js", ".astro", ".json"],
        "project": ["tsconfig.json"],
      },
    },
  },
  "ignores": [
    "/dist/**",
    "node_modules/",
    "vite.config.ts",
    "public/draco/",
  ],
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "prettier",
    "plugin:astro/recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],
        "pathGroups": [
          {
            "pattern": "astro",
            "group": "external",
            "position": "before",
          },
          {
            "pattern": "three",
            "group": "external",
            "position": "before",
          },
        ],
        "pathGroupsExcludedImportTypes": ["astro"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true,
        },
      },
    ],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "no-underscore-dangle": ["error", { "allow": ["__typename"] }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" },
    ],
    "@typescript-eslint/no-use-before-define": ["error"],
  },
  "overrides": [
    {
      "files": ["*.astro"],
      "parser": "astro-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "extraFileExtensions": [".astro"],
      },
    },
  ],
  "env": {
    "browser": true,
    "es6": true,
  },
}
