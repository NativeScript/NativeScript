import { getNativeApplication, android as androidApp } from '../application';
import { Trace } from '../trace';

// We are using "ad" here to avoid namespace collision with the global android object
export namespace ad {
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
	export function getApplication() {
		if (!application) {
			application = <android.app.Application>getNativeApplication();
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
		} else if (androidApp.foregroundActivity instanceof androidx.appcompat.app.AppCompatActivity) {
			const decorView = androidApp.foregroundActivity.getWindow().getDecorView();
			windowToken = decorView ? decorView.getWindowToken() : null;
		}

		if (inputManager && windowToken) {
			inputManager.hideSoftInputFromWindow(windowToken, 0);
		}
	}

	export namespace collections {
		export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
			const hashSet = new java.util.HashSet<string>();
			if (str !== undefined) {
				for (let element in str) {
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
				let field = attr.getField(name);
				if (field) {
					colorID = field.getInt(null);
				}

				if (colorID) {
					let typedValue = new android.util.TypedValue();
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
}

export const iOSNativeHelper = 0;
