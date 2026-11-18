import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { withPwa } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		withPwa(
			{
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter({ fallback: '200.html' })
			},
			{
				strategies: 'buildSW',
				registerType: 'autoUpdate',
				kit: { adapterFallback: '200.html' },
				manifest: {
					name: 'Cartouche',
					short_name: 'Cartouche',
					description: 'L’actualité du jour, croisée et sourcée.',
					lang: 'fr',
					start_url: '/',
					scope: '/',
					display: 'standalone',
					theme_color: '#f3f1ea',
					background_color: '#f3f1ea',
					icons: [
						{ src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
						{ src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
						{
							src: '/icone-maskable-512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable'
						}
					]
				},
				buildSW: { swSrc: 'src/sw.ts' }
			}
		)
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.test.ts', 'worker/**/*.test.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
