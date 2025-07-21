// Import necessary ESLint plugins and configurations.
import js from '@eslint/js'; // Recommended ESLint rules for JavaScript.
import globals from 'globals'; // Provides global variables for different environments (e.g., browser, Node.js).
import reactHooks from 'eslint-plugin-react-hooks'; // ESLint rules for React Hooks.
import reactRefresh from 'eslint-plugin-react-refresh'; // ESLint rules for React Fast Refresh.

// Export the ESLint configuration array.
export default [
  // Configuration for files to ignore during linting.
  { ignores: ['dist'] }, // Ignores the 'dist' directory, which contains the build output.
  // Main configuration object for JavaScript and JSX files.
  {
    files: ['**/*.{js,jsx}'], // Specifies that these rules apply to all .js and .jsx files.
    languageOptions: {
      ecmaVersion: 2020, // Sets the ECMAScript version to 2020.
      globals: globals.browser, // Defines browser global variables (e.g., window, document).
      parserOptions: {
        ecmaVersion: 'latest', // Uses the latest ECMAScript version supported by the parser.
        ecmaFeatures: { jsx: true }, // Enables JSX parsing.
        sourceType: 'module', // Allows the use of ES modules (import/export).
      },
    },
    plugins: {
      'react-hooks': reactHooks, // Registers the react-hooks plugin.
      'react-refresh': reactRefresh, // Registers the react-refresh plugin.
    },
    rules: {
      ...js.configs.recommended.rules, // Includes all recommended JavaScript rules.
      ...reactHooks.configs.recommended.rules, // Includes all recommended React Hooks rules.
      // Custom rule to ignore unused variables that start with an uppercase letter or underscore.
      // This is useful for components or types that might be imported but not directly used in JSX.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Rule from react-refresh to warn about components that might break Fast Refresh.
      // `allowConstantExport: true` allows constant exports, which is common in Vite.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
