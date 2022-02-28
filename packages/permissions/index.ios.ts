import { Device, Trace } from '@nativescript/core';
import { PermissionStatus } from './common';
import { PermissionCheckOptions, PermissionsType, PermissionRequestOptions } from '.';

export * from './common';

export namespace PermissionsIOS {
	namespace NSPLocation {
		let status: PermissionStatus = PermissionStatus.undetermined;
		function getStatusFromCLAuthorizationStatus(lStatus: CLAuthorizationStatus, type?: string): [PermissionStatus, boolean] {
			let always = false;
			switch (lStatus) {
				case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways:
					always = true;
					status = PermissionStatus.authorized;
					break;
				case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse:
					status = PermissionStatus.authorized;
					break;
				case CLAuthorizationStatus.kCLAuthorizationStatusDenied:
					status = PermissionStatus.denied;
					break;
				case CLAuthorizationStatus.kCLAuthorizationStatusRestricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			if (Trace.isEnabled()) {
				Trace.write(`NSPLocation getStatusFromCLAuthorizationStatus ${status}`, Trace.categories.Permissions, Trace.messageType.info);
			}
			return [status, always];
		}
		export function getStatusForType(type?: string): [PermissionStatus, boolean] {
			const status2 = CLLocationManager.authorizationStatus();
			return getStatusFromCLAuthorizationStatus(status2, type);
		}
		let locationManager: CLLocationManager;
		let locationManagerDelegate: CLLocationManagerDelegateImpl;
		export type SubCLLocationManagerDelegate = Partial<CLLocationManagerDelegate>;
		@NativeClass
		export class CLLocationManagerDelegateImpl extends NSObject implements CLLocationManagerDelegate {
			public static ObjCProtocols = [CLLocationManagerDelegate];

			private subDelegates: SubCLLocationManagerDelegate[];

			public addSubDelegate(delegate: SubCLLocationManagerDelegate) {
				if (!this.subDelegates) {
					this.subDelegates = [];
				}
				const index = this.subDelegates.indexOf(delegate);
				if (index === -1) {
					this.subDelegates.push(delegate);
				}
			}

			public removeSubDelegate(delegate: SubCLLocationManagerDelegate) {
				const index = this.subDelegates.indexOf(delegate);
				if (index !== -1) {
					this.subDelegates.splice(index, 1);
				}
			}
			static new(): CLLocationManagerDelegateImpl {
				return super.new() as CLLocationManagerDelegateImpl;
			}
			public initDelegate() {
				this.subDelegates = [];
				return this;
			}
			locationManagerDidChangeAuthorizationStatus(manager: CLLocationManager, status: CLAuthorizationStatus) {
				this.subDelegates &&
					this.subDelegates.forEach((d) => {
						if (d.locationManagerDidChangeAuthorizationStatus) {
							d.locationManagerDidChangeAuthorizationStatus(manager, status);
						}
					});
			}
			// locationManagerDidFailWithError(manager: CLLocationManager, error: NSError) {
			//     this.subDelegates &&
			//         this.subDelegates.forEach(d => {
			//             if (d.locationManagerDidFailWithError) {
			//                 d.locationManagerDidFailWithError(manager, error);
			//             }
			//         });
			// }
		}
		export function request(type): Promise<[PermissionStatus, boolean]> {
			const status = getStatusForType(type);
			if (Trace.isEnabled()) {
				Trace.write(`NSPLocation request ${type}`, Trace.categories.Permissions, Trace.messageType.info);
			}
			if (status[0] === PermissionStatus.undetermined) {
				return new Promise((resolve, reject) => {
					if (!locationManager) {
						locationManager = CLLocationManager.new();
					}
					if (!locationManagerDelegate) {
						locationManagerDelegate = CLLocationManagerDelegateImpl.new().initDelegate();
						locationManager.delegate = locationManagerDelegate;
					}
					const subD = {
						locationManagerDidChangeAuthorizationStatus: (manager, status: CLAuthorizationStatus) => {
							if (Trace.isEnabled()) {
								Trace.write(`locationManagerDidChangeAuthorizationStatus ${status}`, Trace.categories.Permissions, Trace.messageType.info);
							}
							if (status !== CLAuthorizationStatus.kCLAuthorizationStatusNotDetermined) {
								if (locationManagerDelegate) {
									locationManagerDelegate.removeSubDelegate(subD);
									locationManagerDelegate = null;
								}
								if (locationManager) {
									locationManager.delegate = null;
									locationManager = null;
								}
								const rStatus = getStatusFromCLAuthorizationStatus(status, type);
								resolve(rStatus);
								// } else {
								// reject('kCLAuthorizationStatusNotDetermined');
							}
						},
					};
					locationManagerDelegate.addSubDelegate(subD);
					try {
						if (Trace.isEnabled()) {
							Trace.write(`NSPLocation requestAuthorization ${type}`, Trace.categories.Permissions, Trace.messageType.info);
						}
						if (type === 'always') {
							locationManager.requestAlwaysAuthorization();
						} else {
							locationManager.requestWhenInUseAuthorization();
						}
					} catch (e) {
						reject(e);
						if (locationManagerDelegate) {
							locationManagerDelegate.removeSubDelegate(subD);
							locationManagerDelegate = null;
						}
						if (locationManager) {
							locationManager.delegate = null;
							locationManager = null;
						}
					}
				});
			} else {
				// if (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse && type === 'always') {
				//     return Promise.resolve(PermissionStatus.denied);
				// } else {
				return Promise.resolve(status);
				// }
			}
		}
	}
	namespace NSPBluetooth {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			const status2 = CBPeripheralManager.authorizationStatus();
			switch (status2) {
				case CBPeripheralManagerAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case CBPeripheralManagerAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case CBPeripheralManagerAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}
		export type SubCBPeripheralManagerDelegate = Partial<CBPeripheralManagerDelegate>;
		@NativeClass
		export class CBPeripheralManagerDelegateImpl extends NSObject implements CBPeripheralManagerDelegate {
			public static ObjCProtocols = [CBPeripheralManagerDelegate];

			private subDelegates: SubCBPeripheralManagerDelegate[];

			public addSubDelegate(delegate: SubCBPeripheralManagerDelegate) {
				const index = this.subDelegates.indexOf(delegate);
				if (index === -1) {
					this.subDelegates.push(delegate);
				}
			}

			public removeSubDelegate(delegate: SubCBPeripheralManagerDelegate) {
				const index = this.subDelegates.indexOf(delegate);
				if (index !== -1) {
					this.subDelegates.splice(index, 1);
				}
			}
			static new(): CBPeripheralManagerDelegateImpl {
				return super.new() as CBPeripheralManagerDelegateImpl;
			}
			public initDelegate(): CBPeripheralManagerDelegateImpl {
				this.subDelegates = [];
				return this;
			}
			peripheralManagerDidUpdateState(peripheralManager) {
				this.subDelegates.forEach((d) => {
					if (d.peripheralManagerDidUpdateState) {
						d.peripheralManagerDidUpdateState(peripheralManager);
					}
				});
			}
		}
		let peripheralManager: CBPeripheralManager;
		export function request(): Promise<[PermissionStatus, boolean]> {
			const status = getStatus();
			if (status[0] === PermissionStatus.undetermined) {
				return new Promise((resolve, reject) => {
					if (!peripheralManager) {
						peripheralManager = CBPeripheralManager.new();
						peripheralManager.delegate = CBPeripheralManagerDelegateImpl.new().initDelegate();
					}
					const subD = {
						peripheralManagerDidUpdateState: (peripheralManager) => {
							if (peripheralManager) {
								peripheralManager.stopAdvertising();
								(peripheralManager.delegate as CBPeripheralManagerDelegateImpl).removeSubDelegate(subD);
								peripheralManager.delegate = null;
								peripheralManager = null;
							}
							// for some reason, checking permission right away returns denied. need to wait a tiny bit
							setTimeout(() => {
								resolve(getStatus());
							}, 100);
						},
					};
					(peripheralManager.delegate as CBPeripheralManagerDelegateImpl).addSubDelegate(subD);
					try {
						peripheralManager.startAdvertising(null);
					} catch (e) {
						reject(e);
					}
				});
			} else {
				return Promise.resolve(status);
			}
		}
	}
	namespace NSPAudioVideo {
		let status: PermissionStatus = PermissionStatus.undetermined;
		function typeFromString(value: string) {
			if (value === 'audio') {
				return AVMediaTypeAudio;
			} else {
				return AVMediaTypeVideo;
			}
		}
		export function getStatus(type?: string): [PermissionStatus, boolean] {
			const videoStatus = AVCaptureDevice.authorizationStatusForMediaType(typeFromString(type));
			switch (videoStatus) {
				case AVAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case AVAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case AVAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(type): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve, reject) => {
				AVCaptureDevice.requestAccessForMediaTypeCompletionHandler(typeFromString(type), (granted) => resolve(getStatus(type)));
			});
		}
	}
	namespace NSPSpeechRecognition {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			const speechStatus = SFSpeechRecognizer.authorizationStatus();
			switch (speechStatus) {
				case SFSpeechRecognizerAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case SFSpeechRecognizerAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case SFSpeechRecognizerAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve) => {
				SFSpeechRecognizer.requestAuthorization(() => resolve(getStatus()));
			});
		}
	}
	namespace NSPPhoto {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			let photoStatus: PHAuthorizationStatus;
			if (parseFloat(Device.osVersion) >= 14) {
				photoStatus = PHPhotoLibrary.authorizationStatusForAccessLevel(PHAccessLevel.ReadWrite);
			} else {
				photoStatus = PHPhotoLibrary.authorizationStatus();
			}
			switch (photoStatus) {
				case PHAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case PHAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case PHAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve) => {
				PHPhotoLibrary.requestAuthorization(() => resolve(getStatus()));
			});
		}
	}
	namespace NSPMotion {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			if (status === PermissionStatus.undetermined) {
				const cmStatus = CMMotionActivityManager.authorizationStatus as any as CMAuthorizationStatus;
				switch (cmStatus) {
					case CMAuthorizationStatus.Authorized:
						status = PermissionStatus.authorized;
						break;
					case CMAuthorizationStatus.Denied:
						status = PermissionStatus.denied;
						break;
					case CMAuthorizationStatus.Restricted:
						status = PermissionStatus.restricted;
						break;
				}
			}
			return [status, true];
		}

		export function request(): Promise<[PermissionStatus, boolean]> {
			if (status === PermissionStatus.undetermined) {
				return new Promise((resolve) => {
					let activityManager = CMMotionActivityManager.new();
					let motionActivityQueue = NSOperationQueue.new();
					if (Trace.isEnabled()) {
						Trace.write(`NSPMotion request ${status}`, Trace.categories.Permissions, Trace.messageType.info);
					}
					activityManager.queryActivityStartingFromDateToDateToQueueWithHandler(NSDate.distantPast, new Date(), motionActivityQueue, (activities, error) => {
						if (error) {
							status = PermissionStatus.denied;
						} else if (activities || !error) {
							status = PermissionStatus.authorized;
						}
						if (Trace.isEnabled()) {
							Trace.write(`NSPMotion got response ${status}`, Trace.categories.Permissions, Trace.messageType.info);
						}
						resolve([status, true]);
						activityManager = null;
						motionActivityQueue = null;
					});
				});
			} else {
				return Promise.resolve([status, true]);
			}
		}
	}
	namespace NSPMediaLibrary {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			const mediaStatus = MPMediaLibrary.authorizationStatus();
			switch (mediaStatus) {
				case MPMediaLibraryAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case MPMediaLibraryAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case MPMediaLibraryAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve) => {
				MPMediaLibrary.requestAuthorization(() => resolve(getStatus()));
			});
		}
	}
	namespace NSPNotification {
		let status: PermissionStatus = PermissionStatus.undetermined;
		const NSPDidAskForNotification = 'NSPDidAskForNotification';
		export async function getStatus(): Promise<[PermissionStatus, boolean]> {
			const didAskForPermission = NSUserDefaults.standardUserDefaults.boolForKey(NSPDidAskForNotification);
			let isEnabled = false;
			const osVersion = parseFloat(Device.osVersion);
			if (osVersion >= 10) {
				isEnabled = (await new Promise<UNNotificationSettings>((resolve) => UNUserNotificationCenter.currentNotificationCenter().getNotificationSettingsWithCompletionHandler(resolve))) !== (UNAuthorizationOptionNone as any);
			} else {
				isEnabled = UIApplication.sharedApplication.currentUserNotificationSettings.types !== UIUserNotificationType.None;
			}

			if (isEnabled) {
				status = PermissionStatus.authorized;
			} else {
				status = didAskForPermission ? PermissionStatus.denied : PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(types: UIUserNotificationType | UNAuthorizationOptions): Promise<[PermissionStatus, boolean]> {
			const status = getStatus();

			if (status[0] === PermissionStatus.undetermined) {
				return new Promise((resolve, reject) => {
					const observer = function () {
						resolve(getStatus());
						NSNotificationCenter.defaultCenter.removeObserver(observer);
					};
					NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock(UIApplicationDidBecomeActiveNotification, null, null, observer);
					const osVersion = parseFloat(Device.osVersion);
					if (osVersion >= 10) {
						UNUserNotificationCenter.currentNotificationCenter().requestAuthorizationWithOptionsCompletionHandler(types as UNAuthorizationOptions, (p1: boolean, error: NSError) => {
							if (error) {
								reject(error);
							} else {
								UIApplication.sharedApplication.registerForRemoteNotifications();
								NSUserDefaults.standardUserDefaults.setBoolForKey(true, NSPDidAskForNotification);
								NSUserDefaults.standardUserDefaults.synchronize();
							}
						});
					} else {
						const settings = UIUserNotificationSettings.settingsForTypesCategories(types as UIUserNotificationType, null);
						UIApplication.sharedApplication.registerUserNotificationSettings(settings);
						UIApplication.sharedApplication.registerForRemoteNotifications();

						NSUserDefaults.standardUserDefaults.setBoolForKey(true, NSPDidAskForNotification);
						NSUserDefaults.standardUserDefaults.synchronize();
					}
				});
			} else {
				return Promise.resolve(status);
			}
		}
	}
	namespace NSPContacts {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			const contactStatus = CNContactStore.authorizationStatusForEntityType(CNEntityType.Contacts);
			switch (contactStatus) {
				case CNAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case CNAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case CNAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve) => {
				const contactStore = CNContactStore.new();
				contactStore.requestAccessForEntityTypeCompletionHandler(CNEntityType.Contacts, () => resolve(getStatus()));
			});
		}
	}
	namespace NSPBackgroundRefresh {
		let status: PermissionStatus = PermissionStatus.undetermined;
		export function getStatus(): [PermissionStatus, boolean] {
			const refreshStatus = UIApplication.sharedApplication.backgroundRefreshStatus;
			switch (refreshStatus) {
				case UIBackgroundRefreshStatus.Available:
					status = PermissionStatus.authorized;
					break;
				case UIBackgroundRefreshStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case UIBackgroundRefreshStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(): Promise<PermissionStatus> {
			return new Promise((resolve) => {
				const contactStore = CNContactStore.new();
				contactStore.requestAccessForEntityTypeCompletionHandler(CNEntityType.Contacts, () => resolve(getStatus()[0]));
			});
		}
	}
	namespace NSPEvent {
		let status: PermissionStatus = PermissionStatus.undetermined;
		function typeFromString(value: string) {
			if (value === 'reminder') {
				return EKEntityType.Reminder;
			} else {
				return EKEntityType.Event;
			}
		}
		export function getStatus(type?: string): [PermissionStatus, boolean] {
			const eventStatus = EKEventStore.authorizationStatusForEntityType(typeFromString(type));
			switch (eventStatus) {
				case EKAuthorizationStatus.Authorized:
					status = PermissionStatus.authorized;
					break;
				case EKAuthorizationStatus.Denied:
					status = PermissionStatus.denied;
					break;
				case EKAuthorizationStatus.Restricted:
					status = PermissionStatus.restricted;
					break;
				default:
					status = PermissionStatus.undetermined;
			}
			return [status, true];
		}

		export function request(type?: string): Promise<[PermissionStatus, boolean]> {
			return new Promise((resolve) => {
				const aStore = EKEventStore.new();
				aStore.requestAccessToEntityTypeCompletion(typeFromString(type), () => resolve(getStatus(type)));
			});
		}
	}

	export enum NSType {
		Location = 'location',
		Camera = 'camera',
		Microphone = 'microphone',
		Photo = 'photo',
		Contacts = 'contacts',
		Event = 'event',
		Reminder = 'reminder',
		Bluetooth = 'bluetooth',
		Notification = 'notification',
		BackgroundRefresh = 'backgroundRefresh',
		NSPTypeSpeechRecognition = 'speechRecognition',
		MediaLibrary = 'mediaLibrary',
		Motion = 'motion',
	}

	export function openSettings() {
		return new Promise((resolve, reject) => {
			const center = NSNotificationCenter.defaultCenter;
			const observer = function (notif) {
				resolve(true);
				center.removeObserver(observer);
			};
			center.addObserverForNameObjectQueueUsingBlock(UIApplicationDidBecomeActiveNotification, null, null, observer);
			UIApplication.sharedApplication.openURL(NSURL.URLWithString(UIApplicationOpenSettingsURLString));
		});
	}
	export function canOpenSettings() {
		return Promise.resolve(UIApplicationOpenSettingsURLString !== null);
	}
	export async function getPermissionStatus(type, json): Promise<[PermissionStatus, boolean]> {
		let status: [PermissionStatus, boolean];
		if (Trace.isEnabled()) {
			Trace.write(`getPermissionStatus ${type}`, Trace.categories.Permissions, Trace.messageType.info);
		}

		switch (type) {
			case NSType.Location: {
				// NSString *locationPermissionType = [RCTConvert NSString:json];
				status = NSPLocation.getStatusForType(json);
				break;
			}
			case NSType.Camera:
				status = NSPAudioVideo.getStatus('video');
				break;
			case NSType.Microphone:
				status = NSPAudioVideo.getStatus('audio');
				break;
			case NSType.Photo:
				status = NSPPhoto.getStatus();
				break;
			case NSType.Contacts:
				status = NSPContacts.getStatus();
				break;
			case NSType.Event:
				status = NSPEvent.getStatus('event');
				break;
			case NSType.Reminder:
				status = NSPEvent.getStatus('reminder');
				break;
			case NSType.Bluetooth:
				status = NSPBluetooth.getStatus();
				break;
			case NSType.Notification:
				status = await NSPNotification.getStatus();
				break;
			case NSType.BackgroundRefresh:
				status = NSPBackgroundRefresh.getStatus();
				break;
			case NSType.NSPTypeSpeechRecognition:
				status = NSPSpeechRecognition.getStatus();
				break;
			case NSType.MediaLibrary:
				status = NSPMediaLibrary.getStatus();
				break;
			case NSType.Motion:
				status = NSPMotion.getStatus();
				break;
			default:
				break;
		}

		return status;
	}
	export function requestPermission(type, json): Promise<[PermissionStatus, boolean]> {
		if (Trace.isEnabled()) {
			Trace.write(`requestPermission ${type}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		switch (type) {
			case NSType.Location:
				return NSPLocation.request(json);
			case NSType.Camera:
				return NSPAudioVideo.request('video');
			case NSType.Microphone:
				return NSPAudioVideo.request('audio');
			case NSType.Photo:
				return NSPPhoto.request();
			case NSType.Contacts:
				return NSPContacts.request();
			case NSType.Event:
				return NSPEvent.request('event');
			case NSType.Reminder:
				return NSPEvent.request('reminder');
			case NSType.Bluetooth:
				return NSPBluetooth.request();
			case NSType.Notification:
				let types: UIUserNotificationType;
				const typeStrings: string[] = json;
				const osVersion = parseFloat(Device.osVersion);
				if (osVersion >= 10) {
					if (typeStrings.indexOf('alert') !== -1) {
						types = types | UNAuthorizationOptions.Alert;
					}
					if (typeStrings.indexOf('badge') !== -1) {
						types = types | UNAuthorizationOptions.Badge;
					}
					if (typeStrings.indexOf('sound') !== -1) {
						types = types | UNAuthorizationOptions.Sound;
					}
					if (typeStrings.indexOf('providesAppNotificationSettings') !== -1 && parseFloat(Device.osVersion) >= 12) {
						types = types | UNAuthorizationOptions.ProvidesAppNotificationSettings;
					}
				} else {
					if (typeStrings.indexOf('alert') !== -1) {
						types = types | UIUserNotificationType.Alert;
					}
					if (typeStrings.indexOf('badge') !== -1) {
						types = types | UIUserNotificationType.Badge;
					}
					if (typeStrings.indexOf('sound') !== -1) {
						types = types | UIUserNotificationType.Sound;
					}
				}

				return NSPNotification.request(types);
			case NSType.NSPTypeSpeechRecognition:
				return NSPSpeechRecognition.request();
			case NSType.MediaLibrary:
				return NSPMediaLibrary.request();
			case NSType.Motion:
				return NSPMotion.request();
			default:
				return Promise.reject('unknown');
		}
	}
}

const DEFAULTS = {
	location: 'whenInUse',
	notification: ['alert', 'badge', 'sound'],
};

type IOSPermissionTypes = `${PermissionsIOS.NSType}`;
const permissionTypes = Object.values(PermissionsIOS.NSType) as IOSPermissionTypes[];
type SingleResult = [PermissionStatus, boolean];
interface MultipleResult {
	[k: string]: PermissionStatus;
}
type Result<T> = T extends any[] ? MultipleResult : SingleResult;

export class Permissions {
	static canOpenSettings() {
		return PermissionsIOS.canOpenSettings();
	}
	static openSettings() {
		return PermissionsIOS.openSettings();
	}
	static getTypes() {
		return permissionTypes;
	}
	static check(permission: IOSPermissionTypes, options?: PermissionCheckOptions): Promise<SingleResult> {
		if (Trace.isEnabled()) {
			Trace.write(`check ${permission}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		if (permissionTypes.indexOf(permission) === -1) {
			if (Trace.isEnabled()) {
				Trace.write(`'${permission}' is not a valid permission type on iOS`, Trace.categories.Permissions, Trace.messageType.warn);
			}

			return Promise.resolve([PermissionStatus.authorized, true]);
		}

		let type: PermissionCheckOptions;

		if (typeof options === 'string') {
			type = options;
		} else if (options && options.type) {
			type = options.type;
		}

		return PermissionsIOS.getPermissionStatus(permission, type || DEFAULTS[permission]);
	}
	static async request<T extends IOSPermissionTypes | IOSPermissionTypes[]>(permission: T, options?: PermissionRequestOptions): Promise<Result<T>> {
		if (Trace.isEnabled()) {
			Trace.write(`request ${permission}`, Trace.categories.Permissions, Trace.messageType.info);
		}
		if (Array.isArray(permission)) {
			const grantedPermissions: Result<IOSPermissionTypes[]> = {};
			for (let index = 0; index < permission.length; index++) {
				const res = await Permissions.request(permission[index], options);
				grantedPermissions[permission[index]] = res[0];
			}
			return Promise.resolve(grantedPermissions as Result<T>);
		}
		if (permissionTypes.indexOf(permission) === -1) {
			if (Trace.isEnabled()) {
				Trace.write(`'${permission}' is not a valid permission type on iOS`, Trace.categories.Permissions, Trace.messageType.warn);
			}

			return Promise.resolve([PermissionStatus.authorized, true] as Result<T>);
		}

		//@ts-ignore
		if (permission === 'backgroundRefresh') {
			throw new Error('You cannot request backgroundRefresh');
		}

		let type: PermissionRequestOptions;

		if (typeof options === 'string') {
			type = options;
		} else if (options && options.type) {
			type = options.type;
		}

		//@ts-ignore
		return PermissionsIOS.requestPermission(permission, type || DEFAULTS[permission]);
	}
	static checkMultiple(permissions: PermissionsType[]) {
		return Promise.all(permissions.map((permission) => Permissions.check(<any>permission))).then((result) =>
			result.reduce((acc, value, index) => {
				const name = permissions[index];
				acc[name] = value;
				return acc;
			}, {})
		);
	}
}
