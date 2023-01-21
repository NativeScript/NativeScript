import { NativeScriptConfig } from '@nativescript/core';

export default {
	// I'd call it .new but that's a reserved token for Android
	id: 'org.nativescript.dom.events.proposed',
	appResourcesPath: '../../tools/assets/App_Resources',
	android: {
		v8Flags: '--expose_gc',
		markingMode: 'none',
	},
	appPath: 'src',
	cli: {
		packageManager: 'npm',
	},
} as NativeScriptConfig;
