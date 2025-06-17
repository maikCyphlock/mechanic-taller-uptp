// @ts-check
import { defineConfig } from 'astro/config';
import PoweredWebAppBuilder from "webapp-astro-pwa/pwa";
import svelte from "@astrojs/svelte";
import node from '@astrojs/node'
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [
        PoweredWebAppBuilder({}), 
        svelte()
    ],
    adapter: vercel({
        edgeMiddleware: true,
        includeFiles: ['./src/**/*'],
        maxDuration: 10
    }),
    vite: {
        plugins: [tailwindcss()],
        ssr: {
            noExternal: ['@astrojs/vercel']
        },
        optimizeDeps: {
            exclude: ['@astrojs/vercel']
        }
    }
});