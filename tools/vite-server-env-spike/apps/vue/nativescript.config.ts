import { NativeScriptConfig } from '@nativescript/core';

export default {
	id: 'org.nativescript.spike.vue',
	appPath: 'app',
	appResourcesPath: '../../../assets/App_Resources',
	cli: {
		packageManager: 'npm',
		additionalPathsToClean: ['.ns-vite-build'],
	},
	bundler: 'vite',
	bundlerConfigPath: 'vite.config.mts',
} as NativeScriptConfig;
