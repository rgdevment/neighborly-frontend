import tseslint from 'typescript-eslint';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import betterTailwindcssPlugin from 'eslint-plugin-better-tailwindcss';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['dist', 'node_modules', '.next', '*.config.*', '*.d.ts'] },

  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: {
      '@next/next': nextPlugin,
      'better-tailwindcss': betterTailwindcssPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals']?.rules,
      ...betterTailwindcssPlugin.configs.recommended.rules,

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  prettierRecommended,
];
