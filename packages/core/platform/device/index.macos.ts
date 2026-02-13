class DeviceRef {
	private _model: string;
	private _osVersion: string;
	private _sdkVersion: string;

	get manufacturer(): string {
		return 'Apple';
	}

	get os(): string {
		return 'macOS';
	}

	get osVersion(): string {
		if (!this._osVersion) {
			const version = NSProcessInfo.processInfo.operatingSystemVersion;
			this._osVersion = `${version.majorVersion}.${version.minorVersion}.${version.patchVersion}`;
		}
		return this._osVersion;
	}

	get model(): string {
		if (!this._model) {
			this._model = NSHost.currentHost.localizedName || 'Mac';
		}
		return this._model;
	}

	get sdkVersion(): string {
		if (!this._sdkVersion) {
			this._sdkVersion = this.osVersion;
		}
		return this._sdkVersion;
	}

	get deviceType(): string {
		return 'Desktop';
	}

	get uuid(): string {
		const userDefaults = NSUserDefaults.standardUserDefaults;
		const uuidKey = 'TNSUUID';
		let appUUID = userDefaults.stringForKey(uuidKey);

		if (!appUUID) {
			appUUID = NSUUID.UUID().UUIDString;
			userDefaults.setObjectForKey(appUUID, uuidKey);
			userDefaults.synchronize();
		}

		return appUUID;
	}

	get language(): string {
		return NSLocale.preferredLanguages[0];
	}

	get region(): string {
		return NSLocale.currentLocale.objectForKey(NSLocaleCountryCode);
	}
}

export const Device = new DeviceRef();
export const device = Device;
