import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'build', 'coverage']),
    {
        files: ['**/*.{js,jsx}'],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            // ── Regole originali Vite ──────────────────────────────────────────
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

            // ── Norme di Progetto sez. 2.2.4.1 ───────────────────────────────

            // Lunghezza massima riga: 100 caratteri
            'max-len': ['error', { code: 100, ignoreUrls: true, ignoreStrings: true }],

            // Variabili e metodi: camelCase
            camelcase: ['error', { properties: 'always' }],

            // Metodi max 30 righe
            'max-lines-per-function': [
                'warn',
                { max: 50, skipBlankLines: true, skipComments: true },
            ],

            // Max 3 livelli di annidamento
            'max-depth': ['error', 3],

            // Evitare variabili globali
            'no-var': 'error',
            'prefer-const': 'error',

            // Gestione errori esplicita
            'no-console': 'warn',

            // Nomi variabili descrittivi (min 2 caratteri)
            'id-length': ['warn', { min: 2, exceptions: ['i', 'j', 'k', 'x', 'y', '_'] }],
        },
    },
    {
        files: ['src/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['src/hooks/*'],
                            message:
                                'Import hooks from src/application/hooks instead of src/hooks.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/presentation/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['src/hooks/*'],
                            message:
                                'Import hooks from src/application/hooks instead of src/hooks.',
                        },
                        {
                            group: [
                                '../state/*',
                                '../../state/*',
                                '../../../state/*',
                                '../infrastructure/*',
                                '../../infrastructure/*',
                                '../../../infrastructure/*',
                                '@state/*',
                                '@infrastructure/*',
                            ],
                            message:
                                'Presentation should access state and infrastructure through application hooks/services.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/application/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@presentation/*', '../presentation/*', '../../presentation/*'],
                            message:
                                'Application must not depend on Presentation. Keep dependency direction Presentation -> Application.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/domain/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@presentation/*',
                                '@application/*',
                                '@infrastructure/*',
                                '@state/*',
                                '../presentation/*',
                                '../../presentation/*',
                                '../application/*',
                                '../../application/*',
                                '../infrastructure/*',
                                '../../infrastructure/*',
                                '../state/*',
                                '../../state/*',
                            ],
                            message:
                                'Domain must remain isolated: only Domain and Shared dependencies are allowed.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/state/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@presentation/*',
                                '@application/*',
                                '@infrastructure/*',
                                '../presentation/*',
                                '../../presentation/*',
                                '../application/*',
                                '../../application/*',
                                '../infrastructure/*',
                                '../../infrastructure/*',
                            ],
                            message:
                                'State should not depend on Presentation, Application or Infrastructure.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/infrastructure/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@presentation/*',
                                '@state/*',
                                '../presentation/*',
                                '../../presentation/*',
                                '../state/*',
                                '../../state/*',
                            ],
                            message: 'Infrastructure must not depend on Presentation or State.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['src/shared/**/*.{js,jsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@presentation/*',
                                '@application/*',
                                '@domain/*',
                                '@infrastructure/*',
                                '@state/*',
                                '../presentation/*',
                                '../../presentation/*',
                                '../application/*',
                                '../../application/*',
                                '../domain/*',
                                '../../domain/*',
                                '../infrastructure/*',
                                '../../infrastructure/*',
                                '../state/*',
                                '../../state/*',
                            ],
                            message:
                                'Shared must be framework-agnostic and cannot depend on project layers.',
                        },
                    ],
                },
            ],
        },
    },
])
