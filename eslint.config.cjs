const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "quotes": ["error", "single", { "avoidEscape": true }],
      "quote-props": ["error", "as-needed"],
      "comma-dangle": ["error", "always-multiline"],
      "eol-last": ["error", "always"],
      "no-trailing-spaces": "error",
      "import/order": ["error", { "groups": ["builtin", "external", "internal", "parent", "sibling", "index"] }],
      "arrow-body-style": ["error", "as-needed"],
      "newline-per-chained-call": "error",
      "semi": ["error", "always"],
      "arrow-parens": ["error", "as-needed"],
      "no-multi-spaces": "error",
      "indent": ["error", 2],
      "no-shadow": "warn",
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "no-param-reassign": "warn",
      "array-callback-return": "warn",
      "prefer-destructuring": "warn",
      "object-curly-spacing": ["error", "always"],
      "no-extra-semi": "error",
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "space-before-blocks": "error",
      "no-use-before-define": "warn",
      "padded-blocks": ["error", "never"],
    }
  },
  {
    ignores: [
      'build/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '*.config.js',
      '*.config.cjs',
      'main.*.js',
      'main.*.css'
    ]
  }
];