import { NativeScriptConfig } from '@nativescript/core';

export default {
	id: 'org.nativescript.ToolBox',
	appPath: 'src',
	appResourcesPath: '../../tools/assets/App_Resources',
	android: {
		v8Flags: '--expose_gc',
		suppressCallJSMethodExceptions: false,
	},
	cli: {
		packageManager: 'npm',
		additionalPathsToClean: ['.ns-vite-build'],
	},
	bundler: 'vite',
	bundlerConfigPath: 'vite.config.ts',
} as NativeScriptConfig;
