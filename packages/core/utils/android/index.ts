import { Color } from '../../color';
import { Application } from '../../application';
import { Trace } from '../../trace';
import { topmost } from '../../ui/frame/frame-stack';

let application: android.app.Application;
let applicationContext: android.content.Context;
let contextResources: android.content.res.Resources;
let packageName: string;

export function getApplicationContext() {
	if (!applicationContext) {
		applicationContext = getApplication().getApplicationContext();
	}

	return applicationContext;
}
export function getCurrentActivity() {
	if (!Application) {
		return null;
	}
	return Application.android.foregroundActivity || Application.android.startActivity;
}
export function getApplication() {
	if (!application) {
		application = Application.android.getNativeApplication();
	}

	return application;
}
export function getResources() {
	if (!contextResources) {
		contextResources = getApplication().getResources();
	}

	return contextResources;
}
export function getPackageName() {
	if (!packageName) {
		packageName = getApplicationContext().getPackageName();
	}

	return packageName;
}

let inputMethodManager: android.view.inputmethod.InputMethodManager;
export function getInputMethodManager(): android.view.inputmethod.InputMethodManager {
	if (!inputMethodManager) {
		inputMethodManager = <android.view.inputmethod.InputMethodManager>getApplicationContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
	}

	return inputMethodManager;
}

export function showSoftInput(nativeView: android.view.View): void {
	const inputManager = getInputMethodManager();
	if (inputManager && nativeView instanceof android.view.View) {
		inputManager.showSoftInput(nativeView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
	}
}

export function dismissSoftInput(nativeView?: android.view.View): void {
	const inputManager = getInputMethodManager();
	let windowToken: android.os.IBinder;

	if (nativeView instanceof android.view.View) {
		if (!nativeView.hasFocus()) {
			return;
		}
		windowToken = nativeView.getWindowToken();
	} else if (getCurrentActivity() instanceof androidx.appcompat.app.AppCompatActivity) {
		const modalDialog = (topmost()?._modalParent ?? (topmost()?.modal as any))?._dialogFragment?.getDialog();
		const window = (modalDialog ?? getCurrentActivity()).getWindow();
		const decorView = window.getDecorView();
		if (decorView) {
			windowToken = decorView.getWindowToken();
			decorView.requestFocus();
		} else {
			windowToken = null;
		}
	}

	if (inputManager && windowToken) {
		inputManager.hideSoftInputFromWindow(windowToken, 0);
	}
}

export namespace collections {
	export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
		const hashSet = new java.util.HashSet<string>();
		if (str !== undefined) {
			for (const element in str) {
				hashSet.add('' + str[element]);
			}
		}

		return hashSet;
	}

	export function stringSetToStringArray(stringSet: any): string[] {
		const arr = [];
		if (stringSet !== undefined) {
			const it = stringSet.iterator();
			while (it.hasNext()) {
				const element = '' + it.next();
				arr.push(element);
			}
		}

		return arr;
	}
}

export namespace resources {
	let attr;
	const attrCache = new Map<string, number>();

	export function getDrawableId(name) {
		return getId(':drawable/' + name);
	}

	export function getStringId(name) {
		return getId(':string/' + name);
	}

	export function getId(name: string): number {
		const resources = getResources();
		const packageName = getPackageName();
		const uri = packageName + name;

		return resources.getIdentifier(uri, null, null);
	}
	export function getResource(name: string, type?: string): number {
		return getResources().getIdentifier(name, type, getPackageName());
	}
	export function getPalleteColor(name: string, context: android.content.Context): number {
		return getPaletteColor(name, context);
	}
	export function getPaletteColor(name: string, context: android.content.Context): number {
		if (attrCache.has(name)) {
			return attrCache.get(name);
		}

		let result = 0;
		try {
			if (!attr) {
				attr = java.lang.Class.forName('androidx.appcompat.R$attr');
			}

			let colorID = 0;
			const field = attr.getField(name);
			if (field) {
				colorID = field.getInt(null);
			}

			if (colorID) {
				const typedValue = new android.util.TypedValue();
				context.getTheme().resolveAttribute(colorID, typedValue, true);
				result = typedValue.data;
			}
		} catch (ex) {
			Trace.write('Cannot get pallete color: ' + name, Trace.categories.Error, Trace.messageType.error);
		}

		attrCache.set(name, result);

		return result;
	}
}

export function isRealDevice(): boolean {
	const fingerprint = android.os.Build.FINGERPRINT;

	return fingerprint != null && (fingerprint.indexOf('vbox') > -1 || fingerprint.indexOf('generic') > -1);
}

const DefaultLightScrim = new Color(0xe6, 0xff, 0xff, 0xff);
const DefaultDarkScrim = new Color(0x80, 0x1b, 0x1b, 0x1b);

let statusBarDarkColor: Color | null = null;
let statusBarLightColor: Color | null = null;

export function setStatusBarColor(lightColor: Color | null = null, darkColor: Color | null = null): void {
	statusBarLightColor = lightColor;
	statusBarDarkColor = darkColor;
	const activity = getCurrentActivity();
	if (activity) {
		enableEdgeToEdge(activity, {
			statusBarLightColor: lightColor,
			statusBarDarkColor: darkColor,
			navigationBarLightColor,
			navigationBarDarkColor,
			handleDarkMode: darkModeHandler,
		});
	}
}

let navigationBarDarkColor: Color | null = null;
let navigationBarLightColor: Color | null = null;

export function setNavigationBarColor(lightColor: Color | null = null, darkColor: Color | null = null): void {
	navigationBarLightColor = lightColor;
	navigationBarDarkColor = darkColor;
	const activity = getCurrentActivity();
	if (activity) {
		enableEdgeToEdge(activity, {
			statusBarLightColor,
			statusBarDarkColor,
			navigationBarLightColor: navigationBarLightColor,
			navigationBarDarkColor: navigationBarDarkColor,
			handleDarkMode: darkModeHandler,
		});
	}
}

let darkModeHandler: ((bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean) | null = null;

export function setDarkModeHandler(handler: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean): void {
	darkModeHandler = handler;
	const activity = getCurrentActivity();
	if (activity) {
		enableEdgeToEdge(activity, {
			statusBarLightColor,
			statusBarDarkColor,
			navigationBarLightColor,
			navigationBarDarkColor,
			handleDarkMode: handler,
		});
	}
}

export function enableEdgeToEdge(
	activity: androidx.appcompat.app.AppCompatActivity,
	options?: {
		statusBarLightColor?: Color;
		statusBarDarkColor?: Color;
		navigationBarLightColor?: Color;
		navigationBarDarkColor?: Color;
		handleDarkMode?: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean;
	},
): void {
	let handleDarkMode: org.nativescript.widgets.Utils.HandleDarkMode;
	let statusBarLight: number = statusBarLightColor?.android ?? 0;
	let statusBarDark: number = statusBarDarkColor?.android ?? 0;
	let navigationBarLight: number = navigationBarLightColor?.android ?? DefaultLightScrim.android;
	let navigationBarDark: number = navigationBarDarkColor?.android ?? DefaultDarkScrim.android;
	if (darkModeHandler) {
		handleDarkMode = new org.nativescript.widgets.Utils.HandleDarkMode({
			onHandle(bar, resources) {
				if (bar === 0) {
					return darkModeHandler('status', resources);
				} else {
					return darkModeHandler('navigation', resources);
				}
			},
		});
	}
	if (options) {
		if (typeof options.handleDarkMode === 'function') {
			handleDarkMode = new org.nativescript.widgets.Utils.HandleDarkMode({
				onHandle(bar, resources) {
					if (bar === 0) {
						return options.handleDarkMode('status', resources);
					} else {
						return options.handleDarkMode('navigation', resources);
					}
				},
			});
		}
		if (options.statusBarLightColor instanceof Color) {
			statusBarLight = options.statusBarLightColor.android;
		}
		if (options.statusBarDarkColor instanceof Color) {
			statusBarDark = options.statusBarDarkColor.android;
		}
		if (options.navigationBarLightColor instanceof Color) {
			navigationBarLight = options.navigationBarLightColor.android;
		}
		if (options.navigationBarDarkColor instanceof Color) {
			navigationBarDark = options.navigationBarDarkColor.android;
		}
	}

	if (handleDarkMode) {
		org.nativescript.widgets.Utils.enableEdgeToEdge(activity, java.lang.Integer.valueOf(statusBarLight), java.lang.Integer.valueOf(statusBarDark), java.lang.Integer.valueOf(navigationBarLight), java.lang.Integer.valueOf(navigationBarDark), handleDarkMode);
	} else {
		org.nativescript.widgets.Utils.enableEdgeToEdge(activity, java.lang.Integer.valueOf(statusBarLight), java.lang.Integer.valueOf(statusBarDark), java.lang.Integer.valueOf(navigationBarLight), java.lang.Integer.valueOf(navigationBarDark));
	}
}
