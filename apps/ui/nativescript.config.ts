import { NativeScriptConfig } from '@nativescript/core';

export default {
	id: 'org.nativescript.uitestsapp',
	appPath: 'src',
	appResourcesPath: '../../tools/assets/App_Resources',
	android: {
		v8Flags: '--expose_gc',
	},
	cli: {
		packageManager: 'npm',
	},
} as NativeScriptConfig;
