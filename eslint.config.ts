import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      // TS Formatting
      'max-len': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'space-before-blocks': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      // Vue Formatting
      'vue/html-indent': ['error', 2, {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      }],
      'vue/html-closing-bracket-newline': ['error', {
        singleline: 'never',
        multiline: 'always',
      }],
      'vue/html-closing-bracket-spacing': ['error', {
        startTag: 'never',
        endTag: 'never',
        selfClosingTag: 'always',
      }],
      'vue/mustache-interpolation-spacing': ['error', 'always'],
      'vue/html-quotes': ['error', 'double'],
      'vue/no-multi-spaces': ['error'],
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/unified-signatures': 'off',
    },
  },
);
