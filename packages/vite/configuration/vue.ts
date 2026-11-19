import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';

export const vueConfig = ({ mode }, options: TypeCheckControlOptions = {}): UserConfig => {
	return mergeConfig(baseConfig({ mode, flavor: 'vue' }), {
		resolve: {
			// Compiled SFCs import from 'vue'; the real package would add runtime-dom and
			// a second runtime-core, whose HMR records never see nativescript-vue's components.
			// @rollup/plugin-alias resolves a bare package to its directory under rolldown
			alias: [{ find: 'vue', replacement: 'nativescript-vue' }],
		},
		plugins: [
			...getTypeCheckPlugins('vue', options.typeCheck),
			// Enable Vue Single File Component support
			vue({
				// NativeScript projects often use <script setup lang="ts">
				script: {
					defineModel: true,
					propsDestructure: true,
				},
				// Keep template compilation basic; transform asset URLs is not needed for NS
				template: {
					transformAssetUrls: false,
					compilerOptions: {
						// Only treat real web custom elements (hyphenated) as custom.
						// DO NOT match PascalCase NativeScript tags.
						isCustomElement: (tag) => tag.includes('-'),
					},
				},
			}),
			// Optional: allow JSX/TSX in Vue components if used
			vueJsx(),
		],
	});
};
