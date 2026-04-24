import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'node_modules']),
    {
        files: ['**/*.ts'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-unused-vars': 'off',
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        },
    },
    {
        files: ['src/tests/**/*.ts', 'src/verifyRAG.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
])
