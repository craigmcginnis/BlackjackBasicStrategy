/* ESLint configuration enforcing Allman brace style */
module.exports = {
    root: true,
    ignorePatterns: ["dist", "coverage"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: [
            // If using project-wide tsconfig for type-aware rules later, add paths here.
        ],
        ecmaVersion: 2022,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        // Enforce opening brace on new line (Allman). 'allman' style equivalent via brace-style rule
        "brace-style": ["error", "allman", { "allowSingleLine": true }],
        // Prefer const for non-reassigned vars
        "prefer-const": "error",
        // Disallow any (already guided by docs) but allow with explicit TODO comment if needed
        "@typescript-eslint/no-explicit-any": ["warn", { "ignoreRestArgs": false }]
    }
};
