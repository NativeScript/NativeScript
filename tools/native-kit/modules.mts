/**
 * The core modules compiled into NativeScriptKit, the native code a native
 * release links instead of a JavaScript runtime. Imports of the modules not
 * listed reach the kit's hand-written counterparts until they are listed.
 */
export const ios = {
	compile: ['application-settings/', 'color/', 'core-types/', 'trace/', 'utils/layout-helper/', 'utils/types.ts'],
	/** Functions the kit implements instead, where core calls an npm package: file, function, the kit's Swift. */
	counterparts: {
		'color/color-utils.ts': { argbFromColorMix: 'ColorMix.argbFromColorMix' },
	},
};
