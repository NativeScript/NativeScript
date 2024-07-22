import { platformNames } from '../common';

type DeviceType = 'Phone' | 'Tablet' | 'Vision';

class DeviceRef {
	private _model: string;
	private _osVersion: string;
	private _sdkVersion: string;
	private _deviceType: DeviceType;

	get manufacturer(): string {
		return 'Apple';
	}

	get os(): string {
		if (__VISIONOS__) {
			return platformNames.visionos;
		} else {
			return platformNames.ios;
		}
	}

	get osVersion(): string {
		if (!this._osVersion) {
			this._osVersion = UIDevice.currentDevice.systemVersion;
		}

		return this._osVersion;
	}

	get model(): string {
		if (!this._model) {
			this._model = UIDevice.currentDevice.model;
		}

		return this._model;
	}

	get sdkVersion(): string {
		if (!this._sdkVersion) {
			this._sdkVersion = UIDevice.currentDevice.systemVersion;
		}

		return this._sdkVersion;
	}

	get deviceType(): DeviceType {
		if (!this._deviceType) {
			if (UIDevice.currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Phone) {
				this._deviceType = 'Phone';
			} else if (UIDevice.currentDevice.userInterfaceIdiom === UIUserInterfaceIdiom.Vision) {
				this._deviceType = 'Tablet';
				// TODO: could add conditions throughout core for this
				// this._deviceType = 'Vision';
			} else {
				this._deviceType = 'Tablet';
			}
		}

		return this._deviceType;
	}

	get uuid(): string {
		const userDefaults = NSUserDefaults.standardUserDefaults;
		const uuid_key = 'TNSUUID';
		let app_uuid = userDefaults.stringForKey(uuid_key);

		if (!app_uuid) {
			app_uuid = NSUUID.UUID().UUIDString;
			userDefaults.setObjectForKey(app_uuid, uuid_key);
			userDefaults.synchronize();
		}

		return app_uuid;
	}

	get language(): string {
		return NSLocale.preferredLanguages[0];
	}

	get region(): string {
		return NSLocale.currentLocale.objectForKey(NSLocaleCountryCode);
	}
}

export const Device = new DeviceRef();

// This retains compatibility with NS6
export const device = Device;
