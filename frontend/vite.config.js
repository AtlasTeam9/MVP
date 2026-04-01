import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
            '@presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
            '@state': fileURLToPath(new URL('./src/state', import.meta.url)),
            '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
            '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.js',
        coverage: {
            reporter: ['text', 'html'],
            include: ['src/**'],
            exclude: ['src/test/**', '**/*.module.css'],
        },
    },
})
