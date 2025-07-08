import { platformCheck } from './platform-check';
import { numberHasDecimals, numberIs64Bit } from './types';
import { Application } from '../application';
import { Trace } from '../trace';
import { topmost } from '../ui/frame/frame-stack';

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

let application: android.app.Application;
let applicationContext: android.content.Context;
let contextResources: android.content.res.Resources;
let packageName: string;

function getApplicationContext() {
	if (!applicationContext) {
		applicationContext = getApplication().getApplicationContext();
	}

	return applicationContext;
}
function getCurrentActivity() {
	if (!Application) {
		return null;
	}
	return Application.android.foregroundActivity || Application.android.startActivity;
}
function getApplication() {
	if (!application) {
		application = Application.android.getNativeApplication();
	}

	return application;
}
function getResources() {
	if (!contextResources) {
		contextResources = getApplication().getResources();
	}

	return contextResources;
}
function getPackageName() {
	if (!packageName) {
		packageName = getApplicationContext().getPackageName();
	}

	return packageName;
}

let inputMethodManager: android.view.inputmethod.InputMethodManager;
function getInputMethodManager(): android.view.inputmethod.InputMethodManager {
	if (!inputMethodManager) {
		inputMethodManager = <android.view.inputmethod.InputMethodManager>getApplicationContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
	}

	return inputMethodManager;
}

function showSoftInput(nativeView: android.view.View): void {
	const inputManager = getInputMethodManager();
	if (inputManager && nativeView instanceof android.view.View) {
		inputManager.showSoftInput(nativeView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
	}
}

function dismissSoftInput(nativeView?: android.view.View): void {
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

namespace collections {
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

namespace resources {
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

export const androidUtils = {
	resources,
	getApplication,
	getCurrentActivity,
	getApplicationContext,
	getResources,
	getPackageName,
	getInputMethodManager,
	showSoftInput,
	dismissSoftInput,
};

/**
 * @deprecated Use `Utils.android` instead.
 */
export const ad = androidUtils;

// these don't exist on Android.Stub them to empty functions.
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
export const ios = platformCheck('Utils.ios');
