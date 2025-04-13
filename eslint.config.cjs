const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
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