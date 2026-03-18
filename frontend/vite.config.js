import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.js',
        coverage: {
            reporter: ['text', 'html'],
            include: [
                'src/domain/**',
                'src/infrastructure/**',
                'src/components/**',
                'src/pages/**',
            ],
            exclude: ['src/test/**', '**/*.module.css'],
        },
    },
})
