import { AndroidActivityRequestPermissionsEventData, AndroidApplication, Application, Trace, ApplicationSettings } from '@nativescript/core';
import { PermissionStatus } from './common';
import { PermissionCheckOptions, PermissionsType, PermissionRationale, PermissionRequestOptions } from '.';

export * from './common';

let ANDROID_SDK = -1;
function getAndroidSDK() {
	if (ANDROID_SDK === -1) {
		ANDROID_SDK = android.os.Build.VERSION.SDK_INT;
	}
	return ANDROID_SDK;
}

const MARSHMALLOW = 23;
const ANDROIDQ = 29;
const ANDROIDS = 31;

function getAndroidActivity() {
	return Application.android.foregroundActivity || Application.android.startActivity;
}

const NativePermissionsTypes: PermissionsType[] = ['location', 'camera', 'mediaLocation', 'microphone', 'contacts', 'event', 'storage', 'photo', 'callPhone', 'readSms', 'receiveSms', 'bluetoothScan', 'bluetoothConnect', 'bluetooth'];
type NativePermissionsNames = typeof NativePermissionsTypes; // type Names = readonly ['Mike', 'Jeff', 'Ben']
type NativePermissions = NativePermissionsNames[number];
function getNativePermissions(permission: NativePermissions, options?) {
	switch (permission) {
		case 'location': {
			const result = [android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION];
			if (getAndroidSDK() >= ANDROIDQ) {
				const type = typeof options === 'string' ? options : options && options.type;
				if (type === 'always') {
					result.push(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION);
				}
			}
			return result;
		}
		case 'camera': {
			return [android.Manifest.permission.CAMERA];
		}
		case 'mediaLocation': {
			if (getAndroidSDK() >= ANDROIDQ) {
				return [android.Manifest.permission.ACCESS_MEDIA_LOCATION];
			}
			break;
		}
		case 'microphone': {
			return [android.Manifest.permission.RECORD_AUDIO];
		}
		case 'contacts': {
			return [android.Manifest.permission.READ_CONTACTS];
		}
		case 'event': {
			return [android.Manifest.permission.READ_CALENDAR];
		}
		case 'storage': {
			return [android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.READ_EXTERNAL_STORAGE];
		}
		case 'photo': {
			return [android.Manifest.permission.WRITE_EXTERNAL_STORAGE];
		}
		case 'callPhone': {
			return [android.Manifest.permission.CALL_PHONE];
		}
		case 'readSms': {
			return [android.Manifest.permission.READ_SMS];
		}
		case 'receiveSms': {
			return [android.Manifest.permission.RECEIVE_SMS];
		}
		case 'bluetoothScan': {
			if (getAndroidSDK() >= ANDROIDS) {
				return [android.Manifest.permission.BLUETOOTH_SCAN];
			}
			break;
		}
		case 'bluetoothConnect': {
			if (getAndroidSDK() >= ANDROIDS) {
				return [android.Manifest.permission.BLUETOOTH_CONNECT];
			}
			break;
		}
		case 'bluetooth': {
			if (getAndroidSDK() >= ANDROIDS) {
				return [android.Manifest.permission.BLUETOOTH_ADVERTISE];
			}
			break;
		}
	}
	return [];
}

const STORAGE_KEY = '@NSPermissions:didAskPermission:';

const setDidAskOnce = (permission: string) => Promise.resolve().then(() => ApplicationSettings.setBoolean(STORAGE_KEY + permission, true));

const getDidAskOnce = (permission: string) => Promise.resolve(!!ApplicationSettings.getBoolean(STORAGE_KEY + permission));

namespace PermissionsAndroid {
	/**
	 * A list of specified "dangerous" permissions that require prompting the user
	 */
	// export const PERMISSIONS = {
	//     READ_CALENDAR: 'android.permission.READ_CALENDAR',
	//     WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',
	//     CAMERA: 'android.permission.CAMERA',
	//     READ_CONTACTS: 'android.permission.READ_CONTACTS',
	//     WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS',
	//     GET_ACCOUNTS: 'android.permission.GET_ACCOUNTS',
	//     ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
	//     ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
	//     RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
	//     READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
	//     CALL_PHONE: 'android.permission.CALL_PHONE',
	//     READ_CALL_LOG: 'android.permission.READ_CALL_LOG',
	//     WRITE_CALL_LOG: 'android.permission.WRITE_CALL_LOG',
	//     ADD_VOICEMAIL: 'com.android.voicemail.permission.ADD_VOICEMAIL',
	//     USE_SIP: 'android.permission.USE_SIP',
	//     PROCESS_OUTGOING_CALLS: 'android.permission.PROCESS_OUTGOING_CALLS',
	//     BODY_SENSORS: 'android.permission.BODY_SENSORS',
	//     SEND_SMS: 'android.permission.SEND_SMS',
	//     RECEIVE_SMS: 'android.permission.RECEIVE_SMS',
	//     READ_SMS: 'android.permission.READ_SMS',
	//     RECEIVE_WAP_PUSH: 'android.permission.RECEIVE_WAP_PUSH',
	//     RECEIVE_MMS: 'android.permission.RECEIVE_MMS',
	//     READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
	//     WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE'
	// };

	export const RESULTS: { GRANTED: PermissionStatus; DENIED: PermissionStatus; NEVER_ASK_AGAIN: PermissionStatus } = {
		GRANTED: PermissionStatus.authorized,
		DENIED: PermissionStatus.denied,
		NEVER_ASK_AGAIN: PermissionStatus.never_ask_again,
	};

	/**
	 * Returns a promise resolving to a boolean value as to whether the specified
	 * permissions has been granted
	 *
	 * See https://facebook.github.io/react-native/docs/permissionsandroid.html#check
	 */
	export async function check(permission: string | string[]) {
		const context: android.content.Context = getAndroidActivity();
		let result = true;
		const granted = android.content.pm.PackageManager.PERMISSION_GRANTED;
		if (!Array.isArray(permission)) {
			permission = [permission];
		}
		if (getAndroidSDK() < MARSHMALLOW) {
			permission.forEach((p) => (result = result && context.checkPermission(p, android.os.Process.myPid(), android.os.Process.myUid()) === granted));
		} else {
			permission.forEach((p) => (result = result && context.checkSelfPermission(p) === granted));
		}
		return result;
	}

	/**
	 * Prompts the user to enable a permission and returns a promise resolving to a
	 * string value indicating whether the user allowed or denied the request
	 *
	 * See https://facebook.github.io/react-native/docs/permissionsandroid.html#request
	 */
	export async function request(permission: string, rationale?: PermissionRationale): Promise<PermissionStatus> {
		// if (rationale) {
		//     const shouldShowRationale = await shouldShowRequestPermissionRationale(permission);

		//     if (shouldShowRationale) {
		//         return new Promise((resolve, reject) => {

		//             NativeModules.DialogManagerAndroid.showAlert(rationale, () => reject(new Error('Error showing rationale')), () => resolve(requestPermission(permission)));
		//         });
		//     }
		// }
		return requestPermission(permission);
	}

	/**
	 * Prompts the user to enable multiple permissions in the same dialog and
	 * returns an object with the permissions as keys and strings as values
	 * indicating whether the user allowed or denied the request
	 *
	 * See https://facebook.github.io/react-native/docs/permissionsandroid.html#requestmultiple
	 */
	export function requestMultiple(permissions: string[]): Promise<{ [permission: string]: PermissionStatus }> {
		return requestMultiplePermissions(permissions);
	}
}

// PermissionsAndroid = new PermissionsAndroid();

let mRequestCode = 0;
function requestPermission(permission: string): Promise<PermissionStatus> {
	const activity: android.app.Activity = getAndroidActivity();
	if (getAndroidSDK() < MARSHMALLOW) {
		return Promise.resolve(activity.checkPermission(permission, android.os.Process.myPid(), android.os.Process.myUid()) === android.content.pm.PackageManager.PERMISSION_GRANTED ? PermissionsAndroid.RESULTS.GRANTED : PermissionsAndroid.RESULTS.DENIED);
	}
	if (activity.checkSelfPermission(permission) === android.content.pm.PackageManager.PERMISSION_GRANTED) {
		return Promise.resolve(PermissionsAndroid.RESULTS.GRANTED);
	}

	return new Promise((resolve, reject) => {
		try {
			const requestCode = mRequestCode++;
			activity.requestPermissions([permission], requestCode);
			Application.android.on(AndroidApplication.activityRequestPermissionsEvent, (args: AndroidActivityRequestPermissionsEventData) => {
				if (args.requestCode === requestCode) {
					if (args.grantResults.length > 0) {
						if (args.grantResults.length > 0 && args.grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED) {
							resolve(PermissionsAndroid.RESULTS.GRANTED);
						} else {
							if (activity.shouldShowRequestPermissionRationale(permission)) {
								resolve(PermissionsAndroid.RESULTS.DENIED);
							} else {
								resolve(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
							}
						}
					} else {
						// it is possible that the permissions request interaction with the user is interrupted. In this case you will receive empty permissions and results arrays which should be treated as a cancellation.
						reject();
					}
				}
			});
		} catch (e) {
			reject(e);
		}
	});
}

async function requestMultiplePermissions(permissions: string[], options?: PermissionRequestOptions): Promise<{ [permission: string]: PermissionStatus }> {
	const grantedPermissions = {};
	const permissionsToCheck = [];
	let checkedPermissionsCount = 0;
	if (Trace.isEnabled()) {
		Trace.write(`requestMultiplePermissions ${permissions}`, Trace.categories.Permissions, Trace.messageType.info);
	}
	const context: android.content.Context = getAndroidActivity();

	for (let i = 0; i < permissions.length; i++) {
		const perm = permissions[i];
		const nativePerm = getNativePermissions(perm as PermissionsType, options)[0];

		if (getAndroidSDK() < MARSHMALLOW) {
			grantedPermissions[perm] = context.checkPermission(nativePerm, android.os.Process.myPid(), android.os.Process.myUid()) === android.content.pm.PackageManager.PERMISSION_GRANTED ? PermissionsAndroid.RESULTS.GRANTED : PermissionsAndroid.RESULTS.DENIED;
			checkedPermissionsCount++;
		} else if (context.checkSelfPermission(nativePerm) === android.content.pm.PackageManager.PERMISSION_GRANTED) {
			grantedPermissions[perm] = PermissionsAndroid.RESULTS.GRANTED;
			checkedPermissionsCount++;
		} else {
			permissionsToCheck.push(perm);
		}
	}
	if (permissions.length === checkedPermissionsCount) {
		return grantedPermissions;
	}
	const activity: android.app.Activity = getAndroidActivity();
	return new Promise((resolve, reject) => {
		try {
			const requestCode = mRequestCode++;

			activity.requestPermissions(permissionsToCheck, requestCode);
			Application.android.on(AndroidApplication.activityRequestPermissionsEvent, (args: AndroidActivityRequestPermissionsEventData) => {
				if (args.requestCode === requestCode) {
					const results = args.grantResults;
					for (let j = 0; j < permissionsToCheck.length; j++) {
						const permission = permissionsToCheck[j];
						if (results.length > j && results[j] === android.content.pm.PackageManager.PERMISSION_GRANTED) {
							grantedPermissions[permission] = PermissionsAndroid.RESULTS.GRANTED;
						} else {
							if (activity.shouldShowRequestPermissionRationale(permission)) {
								grantedPermissions[permission] = PermissionsAndroid.RESULTS.DENIED;
							} else {
								grantedPermissions[permission] = PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
							}
						}
					}
					resolve(grantedPermissions);
				}

				// if (args.grantResults.length > 0 && args.grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED) {
				//     resolve(PermissionStatus.GRANTED);
				// } else {
				//     if (activity.shouldShowRequestPermissionRationale(permission)) {
				//         resolve(PermissionStatus.DENIED);
				//     } else {
				//         resolve(PermissionStatus.NEVER_ASK_AGAIN);
				//     }
				// }
			});
		} catch (e) {
			reject(e);
		}
	});
}

function shouldShowRequestPermissionRationale(permission: string | string[]) {
	if (getAndroidSDK() < MARSHMALLOW) {
		return Promise.resolve(false);
	}
	const activity: android.app.Activity = getAndroidActivity();
	try {
		if (Array.isArray(permission)) {
			return Promise.resolve(permission.reduce((accu, p) => accu && activity.shouldShowRequestPermissionRationale(p), true));
		}
		return Promise.resolve(activity.shouldShowRequestPermissionRationale(permission));
	} catch (e) {
		return Promise.reject(e);
	}
}

export class Permissions {
	static canOpenSettings() {
		return Promise.resolve(true);
	}

	static openSettings() {
		const activity = getAndroidActivity();
		return new Promise<void>((resolve, reject) => {
			const onActivityResultHandler = (data) => {
				if (data.requestCode === 5140) {
					Application.android.off(AndroidApplication.activityResultEvent, onActivityResultHandler);
					resolve();
				}
			};
			Application.android.on(AndroidApplication.activityResultEvent, onActivityResultHandler);
			const intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
			intent.setData(android.net.Uri.parse('package:' + activity.getPackageName()));
			activity.startActivityForResult(intent, 5140);
		});
	}

	static getTypes() {
		return NativePermissionsTypes;
	}

	static async check(permission: PermissionsType, options?: PermissionCheckOptions): Promise<[PermissionStatus, boolean]> {
		if (Trace.isEnabled()) {
			Trace.write(`check ${permission}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		const perms: string | string[] = getNativePermissions(permission, options);
		if (!perms) {
			if (Trace.isEnabled()) {
				Trace.write(`${permission} is not a valid permission type on Android version`, Trace.categories.Permissions, Trace.messageType.warn);
			}
			return [PermissionStatus.authorized, true];
		}

		const isAuthorized = await PermissionsAndroid.check(perms);
		if (isAuthorized) {
			if (getAndroidSDK() >= ANDROIDQ && permission === 'location') {
				const type = typeof options === 'string' ? options : options && options.type;
				if (type === 'always') {
					const backAuthorized = await PermissionsAndroid.check(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION);
					return [PermissionStatus.authorized, backAuthorized];
				}
			}
			return [PermissionStatus.authorized, true];
		}

		return getDidAskOnce(permission).then((didAsk) => {
			if (didAsk) {
				return shouldShowRequestPermissionRationale(perms).then((shouldShow) => [shouldShow ? PermissionStatus.denied : PermissionStatus.restricted, true]);
			}

			return [PermissionStatus.undetermined, true];
		});
	}

	static request(permission: PermissionsType | PermissionsType[] | string[], options?: PermissionRequestOptions): Promise<[PermissionStatus, boolean] | { [permission: string]: PermissionStatus }> {
		if (Trace.isEnabled()) {
			Trace.write(`request ${permission}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		let types: string[] = [];
		if (Array.isArray(permission)) {
			permission.forEach((s) => {
				// if (s.startsWith('android.permission.')) {
				types.push(s);
				// } else {
				// 	types.push(...getNativePermissions(s as PermissionsType, options));
				// }
			});
		} else {
			// if (permission.startsWith('android.permission.')) {
			types.push(permission);
			// } else {
			// 	types = getNativePermissions(permission, options);
			// }
		}
		if (types.length === 0) {
			return Promise.resolve([PermissionStatus.authorized, true]);
		}

		const rationale = typeof options === 'string' ? undefined : options && options.rationale;
		if (types.length > 1) {
			return requestMultiplePermissions(types, options);
		}
		return PermissionsAndroid.request(types[0], rationale).then((result) => {
			// PermissionsAndroid.request() to native module resolves to boolean
			// rather than string if running on OS version prior to Android M
			if (typeof result === 'boolean') {
				return [result ? PermissionStatus.authorized : PermissionStatus.denied, true];
			}

			if (Array.isArray(permission)) {
				return Promise.all(permission.map(setDidAskOnce)).then(() => [result as PermissionStatus, true]);
			}
			return setDidAskOnce(permission).then(() => [result as PermissionStatus, true]);
		});
	}

	static checkMultiple(permissions: PermissionsType[]) {
		if (Trace.isEnabled()) {
			Trace.write(`checkMultiple ${permissions}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		return Promise.all(permissions.map((permission) => this.check(permission))).then((result) =>
			result.reduce((acc, value, index) => {
				const name = permissions[index];
				acc[name] = value;
				return acc;
			}, {})
		);
	}
}
