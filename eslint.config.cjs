// Flat ESLint config (ESLint v9+) enforcing Allman brace style (CommonJS form).
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files-new
// Using require() because package.json isn't set to type=module.
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        ignores: ['dist/**', 'coverage/**'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: tseslint.parser
        },
        rules: {
            'brace-style': ['error', 'allman', { allowSingleLine: true }],
            'prefer-const': 'error',
            '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }]
        }
    }
];
