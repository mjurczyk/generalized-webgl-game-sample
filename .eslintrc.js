module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      tsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/export': 'off',
    'import/named': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-useless-path-segments': 'off',
    'import/extensions': 'off',
    'import/order': 'warn',
    'arrow-body-style': 'off',
    'no-else-return': 'off',
    'no-restricted-globals': 'off',
    'no-return-assign': 'off',
    'no-param-reassign': 'off',
    'spaced-comment': 'off',
    'no-useless-computed-key': 'off',
    'no-nested-ternary': 'off',
    'no-lonely-if': 'off',
    'object-shorthand': 'off',
    'consistent-return': 'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
};
