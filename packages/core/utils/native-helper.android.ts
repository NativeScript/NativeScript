import { platformCheck } from './platform-check';
import { getNativeApplication, android as androidApp } from '../application';
import { Trace } from '../trace';
import { numberHasDecimals, numberIs64Bit } from './types';

const globalThis = global;

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

namespace AndroidUtils {
	let application: globalThis.android.app.Application;
	let applicationContext: globalThis.android.content.Context;
	let contextResources: globalThis.android.content.res.Resources;
	let packageName: string;
	export function getApplicationContext() {
		if (!applicationContext) {
			applicationContext = getApplication().getApplicationContext();
		}

		return applicationContext;
	}
	export function getCurrentActivity() {
		if (!androidApp) {
			return null;
		}
		return androidApp.foregroundActivity || androidApp.startActivity;
	}
	export function getApplication() {
		if (!application) {
			application = <globalThis.android.app.Application>getNativeApplication();
		}

		return application;
	}
	export function getResources() {
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

	let inputMethodManager: globalThis.android.view.inputmethod.InputMethodManager;
	export function getInputMethodManager(): globalThis.android.view.inputmethod.InputMethodManager {
		if (!inputMethodManager) {
			inputMethodManager = <globalThis.android.view.inputmethod.InputMethodManager>getApplicationContext().getSystemService(globalThis.android.content.Context.INPUT_METHOD_SERVICE);
		}

		return inputMethodManager;
	}

	export function showSoftInput(nativeView: globalThis.android.view.View): void {
		const inputManager = getInputMethodManager();
		if (inputManager && nativeView instanceof globalThis.android.view.View) {
			inputManager.showSoftInput(nativeView, globalThis.android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
		}
	}

	export function dismissSoftInput(nativeView?: globalThis.android.view.View): void {
		const inputManager = getInputMethodManager();
		let windowToken: globalThis.android.os.IBinder;

		if (nativeView instanceof globalThis.android.view.View) {
			if (!nativeView.hasFocus()) {
				return;
			}
			windowToken = nativeView.getWindowToken();
		} else if (getCurrentActivity() instanceof androidx.appcompat.app.AppCompatActivity) {
			const decorView = getCurrentActivity().getWindow().getDecorView();
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
		export function getPalleteColor(name: string, context: globalThis.android.content.Context): number {
			return getPaletteColor(name, context);
		}
		export function getPaletteColor(name: string, context: globalThis.android.content.Context): number {
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
					const typedValue = new globalThis.android.util.TypedValue();
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
		const fingerprint = globalThis.android.os.Build.FINGERPRINT;

		return fingerprint != null && (fingerprint.indexOf('vbox') > -1 || fingerprint.indexOf('generic') > -1);
	}
}

/**
 * @deprecated Use `Utils.android` instead.
 */
export import ad = AndroidUtils;

export import android = AndroidUtils;

// these don't exist on Android.Stub them to empty functions.
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
export const ios = platformCheck('Utils.ios');
