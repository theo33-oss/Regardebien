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
				// GitHub Pages renvoie 404.html pour toute adresse inconnue (/edition/…/…) : c'est la
				// page de repli de l'appli, qui lit ensuite l'adresse dans le navigateur.
				adapter: adapter({ fallback: '404.html' }),
				// Sur GitHub Pages le site vit sous /<nom-du-dépôt> : BASE_PATH est fixé par le workflow
				// de déploiement. Chemins absolus pour que les scripts se chargent depuis toute adresse.
				paths: { base: (process.env.BASE_PATH ?? '') as '' | `/${string}`, relative: false }
			},
			{
				strategies: 'buildSW',
				registerType: 'autoUpdate',
				kit: { adapterFallback: '404.html' },
				manifest: {
					name: 'Cartouche',
					short_name: 'Cartouche',
					description: 'L’actualité du jour, croisée et sourcée.',
					lang: 'fr',
					// Adresses relatives au manifeste : valables sous n'importe quel préfixe.
					start_url: './',
					scope: './',
					display: 'standalone',
					theme_color: '#ffffff',
					background_color: '#ffffff',
					icons: [
						{ src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
						{ src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
						{
							src: 'icone-maskable-512.png',
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
