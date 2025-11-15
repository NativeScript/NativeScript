import { Color } from '../color';
import { numberHasDecimals, numberIs64Bit } from './types';
import { getNativeApp } from '../application/helpers-common';
import { getApplicationContext } from '../application/helpers.android';
import { androidGetCurrentActivity } from '../application/helpers';
import { Trace } from '../trace';
import { topmost } from '../ui/frame/frame-stack';

export { getApplicationContext } from '../application/helpers.android';

export function dataDeserialize(nativeData?: any) {
	if (nativeData === null || typeof nativeData !== 'object') {
		return nativeData;
	}
	let store;

	switch (nativeData.getClass().getName()) {
		case 'java.lang.String': {
			return String(nativeData);
		}

		case 'java.lang.Boolean': {
			return String(nativeData) === 'true';
		}

		case 'java.lang.Float':
		case 'java.lang.Integer':
		case 'java.lang.Long':
		case 'java.lang.Double':
		case 'java.lang.Short': {
			return Number(nativeData);
		}

		case 'org.json.JSONArray': {
			store = [];
			for (let j = 0; j < nativeData.length(); j++) {
				store[j] = dataDeserialize(nativeData.get(j));
			}
			break;
		}
		case 'org.json.JSONObject': {
			store = {};
			const i = nativeData.keys();
			let key;
			while (i.hasNext()) {
				key = i.next();
				store[key] = dataDeserialize(nativeData.get(key));
			}
			break;
		}

		case 'androidx.collection.SimpleArrayMap': {
			const count = nativeData.size();
			for (let l = 0; l < count; l++) {
				const key = nativeData.keyAt(l);
				store[key] = dataDeserialize(nativeData.get(key));
			}
			break;
		}

		case 'androidx.collection.ArrayMap':
		case 'android.os.Bundle':
		case 'java.util.HashMap':
		case 'java.util.Map': {
			store = {};
			const keys = nativeData.keySet().toArray();
			for (let k = 0; k < keys.length; k++) {
				const key = keys[k];
				store[key] = dataDeserialize(nativeData.get(key));
			}
			break;
		}

		default:
			if (typeof nativeData === 'object' && nativeData instanceof java.util.List) {
				const array = [];
				const size = nativeData.size();
				for (let i = 0, n = size; i < n; i++) {
					array[i] = dataDeserialize(nativeData.get(i));
				}
				store = array;
			} else {
				store = null;
			}
			break;
	}
	return store;
}

export function dataSerialize(data?: any, wrapPrimitives?: boolean) {
	let store;
	switch (typeof data) {
		case 'string':
		case 'boolean': {
			if (wrapPrimitives) {
				if (typeof data === 'string') {
					return new java.lang.String(data);
				}
				return new java.lang.Boolean(data);
			}
			return data;
		}
		case 'number': {
			const hasDecimals = numberHasDecimals(data);
			if (numberIs64Bit(data)) {
				if (hasDecimals) {
					return java.lang.Double.valueOf(data);
				} else {
					return java.lang.Long.valueOf(data);
				}
			} else {
				if (hasDecimals) {
					return java.lang.Float.valueOf(data);
				} else {
					return java.lang.Integer.valueOf(data);
				}
			}
		}

		case 'object': {
			if (!data) {
				return null;
			}

			if (data instanceof Date) {
				return new java.util.Date(data.getTime());
			}

			if (Array.isArray(data)) {
				store = new java.util.ArrayList();
				data.forEach((item) => store.add(dataSerialize(item, wrapPrimitives)));
				return store;
			}

			if (data.native) {
				return data.native;
			}

			store = new java.util.HashMap();
			Object.keys(data).forEach((key) => store.put(key, dataSerialize(data[key], wrapPrimitives)));
			return store;
		}

		default:
			return null;
	}
}

export function getCurrentActivity() {
	return androidGetCurrentActivity();
}
export function getApplication() {
	return getNativeApp() as android.app.Application;
}
export function getResources() {
	return getApplication().getResources();
}
let packageName: string;
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

export function getWindow() {
	return getCurrentActivity()?.getWindow();
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
		windowToken = nativeView.getWindowToken();

		if (windowToken == null) {
			// in this case the view might already have been removed from view tree
			// but the user might still be wanting to hide the keyboard
			// let s use a deprecated method to ensure we hide it
			if (inputManager?.isAcceptingText()) {
				inputManager.toggleSoftInput(0, 0);
			}
			return;
		}
		if (!nativeView.hasFocus()) {
			return;
		}
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
const DefaultStatusBarLight = new Color(0);
const DefaultStatusBarDark = new Color(0);

interface ISystemColor {
	navigationBarLight: Color;
	navigationBarDark: Color;
	statusBarLight: Color;
	statusBarDark: Color;
	handler?: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean;
}
const systemColors = new WeakMap<androidx.appcompat.app.AppCompatActivity, ISystemColor>();

function setEnableEdgeToEdge(activity: androidx.appcompat.app.AppCompatActivity, existingColors: ISystemColor) {
	enableEdgeToEdge(activity, {
		statusBarLightColor: existingColors.statusBarLight,
		statusBarDarkColor: existingColors.statusBarDark,
		navigationBarLightColor: existingColors.navigationBarLight,
		navigationBarDarkColor: existingColors.navigationBarDark,
		handleDarkMode: existingColors?.handler ?? null,
	});
}

export function setStatusBarColor(options?: { activity?: androidx.appcompat.app.AppCompatActivity; lightColor?: Color; darkColor?: Color }): void {
	const statusBarLightColor = options?.lightColor ?? null;
	const statusBarDarkColor = options?.darkColor ?? null;
	const activity = options?.activity ?? getCurrentActivity();

	if (activity) {
		const existingColors = systemColors.get(activity) ?? {
			navigationBarLight: DefaultLightScrim,
			navigationBarDark: DefaultDarkScrim,
			statusBarLight: DefaultStatusBarLight,
			statusBarDark: DefaultStatusBarDark,
		};
		existingColors.statusBarLight ??= statusBarLightColor;
		existingColors.statusBarDark ??= statusBarDarkColor;
		systemColors.set(getCurrentActivity(), existingColors);

		setEnableEdgeToEdge(activity, existingColors);
	}
}

export function setNavigationBarColor(options?: { activity?: androidx.appcompat.app.AppCompatActivity; lightColor?: Color; darkColor?: Color }): void {
	const navigationBarLightColor = options?.lightColor ?? null;
	const navigationBarDarkColor = options?.darkColor ?? null;
	const activity = options?.activity ?? getCurrentActivity();
	if (activity) {
		const existingColors = systemColors.get(activity) ?? {
			navigationBarLight: DefaultLightScrim,
			navigationBarDark: DefaultDarkScrim,
			statusBarLight: DefaultStatusBarLight,
			statusBarDark: DefaultStatusBarDark,
		};
		existingColors.navigationBarLight ??= navigationBarLightColor;
		existingColors.navigationBarDark ??= navigationBarDarkColor;
		systemColors.set(getCurrentActivity(), existingColors);

		setEnableEdgeToEdge(activity, existingColors);
	}
}

export function setDarkModeHandler(options?: { activity?: androidx.appcompat.app.AppCompatActivity; handler: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean }): void {
	const darkModeHandler = options?.handler ?? null;
	const activity = options?.activity ?? getCurrentActivity();
	if (activity) {
		const existingColors = systemColors.get(activity) ?? {
			navigationBarLight: DefaultLightScrim,
			navigationBarDark: DefaultDarkScrim,
			statusBarLight: DefaultStatusBarLight,
			statusBarDark: DefaultStatusBarDark,
		};

		existingColors.handler ??= darkModeHandler;

		systemColors.set(getCurrentActivity(), existingColors);

		setEnableEdgeToEdge(activity, existingColors);
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
	let statusBarLight: number = 0;
	let statusBarDark: number = 0;
	let navigationBarLight: number = DefaultLightScrim.android;
	let navigationBarDark: number = DefaultDarkScrim.android;
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
