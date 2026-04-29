import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            }
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    optimizeDeps: {
        include: [
            "react-secure-password",
            "react",
            "react-dom",
            "@react-pdf/renderer",
            "pdf-lib"
        ],
        force: true
    },
    build: {
        rollupOptions: {
            external: [
                "@react-pdf/renderer",
                "react-pdf",
                "react-pdf/dist/esm/Page/AnnotationLayer.css",
                "react-pdf/dist/esm/Page/TextLayer.css"
            ],
            output: {
                chunkFileNames: 'js/chunks/[name].[hash].js',
            }
        }
    }
});
