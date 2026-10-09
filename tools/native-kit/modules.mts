/**
 * The core modules compiled into NativeScriptKit, the native code a native
 * release links instead of a JavaScript runtime. A view not listed here is not
 * in the kit: an app using it stops at the compiler's property guard.
 */
export const ios = {
	compile: [
		'abortcontroller/',
		'accessibility/',
		'application-settings/',
		'application/',
		'color/',
		'connectivity/',
		'core-types/',
		'css-mediaquery/',
		'css-value/',
		'css/CSS3Parser.ts',
		'css/CSSNativeScript.ts',
		'css/parser.ts',
		'css/system-classes.ts',
		'data/observable-array/',
		'data/observable/',
		'data/virtual-array/',
		'file-system/',
		'fps-meter/',
		'globals/global-utils.ts',
		'http/',
		'image-asset/',
		'image-source/',
		'js-libs/easysax/',
		'matrix/',
		'module-name-resolver/',
		'media-query-list/',
		'native-window/',
		'platform/',
		'profiling/',
		'text/',
		'trace/',
		'ui/action-bar/',
		'ui/activity-indicator/',
		'ui/animation/',
		'ui/builder/',
		'ui/button/',
		'ui/content-view/',
		'ui/core/',
		'ui/date-picker/',
		'ui/dialogs/',
		'ui/editable-text-base/',
		'ui/embedding/',
		'ui/enums/',
		'ui/frame/',
		'ui/gestures/',
		'ui/html-view/',
		'ui/image-cache/',
		'ui/image/',
		'ui/label/',
		'ui/layouts/absolute-layout/',
		'ui/layouts/dock-layout/',
		'ui/layouts/flexbox-layout/',
		'ui/layouts/grid-layout/',
		'ui/layouts/index.ts',
		'ui/layouts/layout-base-common.ts',
		'ui/layouts/layout-base.ios.ts',
		'ui/layouts/liquid-glass/',
		'ui/layouts/liquid-glass-container/',
		'ui/layouts/root-layout/',
		'ui/layouts/stack-layout/',
		'ui/layouts/wrap-layout/',
		'ui/list-picker/',
		'ui/list-view/',
		'ui/page/',
		'ui/placeholder/',
		'ui/progress/',
		'ui/proxy-view-container/',
		'ui/repeater/',
		'ui/scroll-view/',
		'ui/search-bar/',
		'ui/segmented-bar/',
		'ui/slider/',
		'ui/split-view/',
		'ui/styling/',
		'ui/switch/',
		'ui/tab-view/',
		'ui/text-base/',
		'ui/text-field/',
		'ui/text-view/',
		'ui/time-picker/',
		'ui/transition/',
		'ui/utils.ios.ts',
		'ui/web-view/',
		'utils/',
		'xml/',
	],
	/**
	 * What the kit implements instead: a core file's function, an npm package's export
	 * (`npm:<package>`, `*` for the namespace), a moot module's export (`moot:<file>`), or a file of the app's (`~/package.json`),
	 * to the kit's Swift.
	 */
	counterparts: {
		'color/color-utils.ts': { argbFromColorMix: 'ColorMix.argbFromColorMix' },
		'application/application.ios.ts': {
			installSceneDelegateDefaults: 'ApplicationDelegateClass.installSceneDelegateDefaults',
			warnAboutDelegateClass: 'ApplicationDelegateClass.warnAboutDelegateClass',
			'iOSApplication.delegate': 'ApplicationDelegateClass.delegate',
			'iOSApplication.addDelegateHandler': 'ApplicationDelegateClass.addDelegateHandler',
		},
		'application/scene-delegate-bridge.ts': { getLegacyMethod: 'ApplicationDelegateClass.getLegacyMethod' },
		// acorn is JavaScript: binding expressions are parsed by core's TypeScript parser, which gives acorn's ESTree.
		'ui/core/bindable/bindable-expressions.ts': { parseExpression: 'Core_ui_core_bindable_expression_parser.parseExpressionNode' },
		'connectivity/index.ios.ts': {
			_createReachability: 'CoreConnectivity.createReachability',
			_getReachabilityFlags: 'CoreConnectivity.reachabilityFlags',
			startMonitoring: 'CoreConnectivity.startMonitoring',
			stopMonitoring: 'CoreConnectivity.stopMonitoring',
		},
		'npm:@csstools/css-calc': { calc: 'CorePackages.calc' },
		'npm:emoji-regex': { '*': 'CorePackages.emojiRegex' },
		'~/package.json': { default: 'CorePackages.appConfig' },
	},
	/** Modules a compiled app has no use for (the debugger, the inspector, XMLHttpRequest and fetch): what core reads from them is untyped, and using it throws. */
	moot: ['debugger/', 'xhr/', 'fetch/', 'wgc/', 'inspector_modules'],
	/** Functions that give back what they are given and, as decorators, leave what they decorate as it is. */
	identities: ['profile', 'zonedCallback'],
	/** npm packages compiled with core from the TypeScript they publish (relative to the package; the first is its entry). */
	packages: {
		'css-what': ['src/index.ts', 'src/parse.ts', 'src/types.ts', 'src/stringify.ts'],
	},
};

/**
 * The core modules compiled into kit-android, from their Android files (`*.android.ts`) and the
 * shared ones beside them. The kit's views are core's own: Android views and core's
 * `org.nativescript.widgets` layouts, as NativeScript runs them.
 */
export const android = {
	compile: ios.compile.filter((m) => !m.startsWith('ui/layouts/liquid-glass')).map((m) => (m === 'ui/layouts/layout-base.ios.ts' ? 'ui/layouts/layout-base.android.ts' : m === 'ui/utils.ios.ts' ? 'ui/utils.android.ts' : m)),
	/** As `ios.counterparts`, to the kit's Kotlin. */
	counterparts: {
		'color/color-utils.ts': { argbFromColorMix: 'ColorMix.argbFromColorMix' },
		'npm:emoji-regex': { '*': 'CorePackages.emojiRegex' },
	} as Record<string, Record<string, string>>,
	moot: ios.moot,
	identities: ios.identities,
	packages: ios.packages,
};
