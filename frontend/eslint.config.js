import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  js.configs.recommended,
  // TypeScript recommended configs (using flat config format)
  ...tseslint.configs['flat/recommended'],
  // React recommended configs (using flat config format)
  react.configs.flat.recommended,
  // React hooks recommended configs (using flat config format)
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser, // Browser globals (window, document, fetch, etc.)
        ...globals.node, // Node.js globals (process, global, etc.)
        // React (for automatic JSX runtime)
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
        runtime: 'automatic', // Use automatic JSX runtime (React 17+)
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      // Note: Rules defined here override the recommended configs spread above.
      // In flat config, later config objects override earlier ones.
      
      // Override TypeScript recommended: more lenient unused vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          args: 'after-used',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      
      // Override React recommended: disable rules not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      
      // Quote preferences: prefer single quotes (warn, not error)
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true, // Allow single quotes inside double-quoted strings
          allowTemplateLiterals: true, // Allow template literals
        },
      ],
      'jsx-quotes': ['warn', 'prefer-single'], // Prefer single quotes in JSX attributes
      
      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^\\..*/$'], // Allow directory imports (they resolve to index files)
        },
      ],
      'import/no-unused-modules': 'warn',
      'import/no-duplicates': 'error',
      'import/no-cycle': ['warn', { maxDepth: 10 }], // Downgrade to warning for now
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': [
        'error',
        {
          noUselessIndex: true,
        },
      ],
      'import/first': 'error',
      'import/exports-last': 'off',
      'import/newline-after-import': 'off', // Allow flexible blank lines after imports
      'import/no-absolute-path': 'error',
      'import/no-relative-packages': 'warn',
      
      // General JavaScript rules
      'no-redeclare': ['error', { builtinGlobals: false }], // Allow redeclaring globals
      'no-case-declarations': 'off', // Allow lexical declarations in case blocks
    },
  },
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      'routeTree.gen.ts',
    ],
  },
]
