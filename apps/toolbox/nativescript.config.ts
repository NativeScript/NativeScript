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
	},
} as NativeScriptConfig;
