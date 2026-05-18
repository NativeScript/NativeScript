import { Screen } from '../screen';

const MIN_TABLET_PIXELS = 600;

class DeviceRef {
	private _manufacturer: string;
	private _model: string;
	private _osVersion: string;
	private _uuid: string;

	get manufacturer(): string {
		if (!this._manufacturer) {
			try {
				this._manufacturer = Windows.System.Profile.SystemManufacturerInfo.SmbiosInfo.SystemManufacturer || 'Microsoft';
			} catch {
				this._manufacturer = 'Microsoft';
			}
		}
		return this._manufacturer;
	}

	get os(): string {
		return 'Windows';
	}

	get osVersion(): string {
		if (!this._osVersion) {
			try {
				const versionStr = Windows.System.Profile.AnalyticsInfo.VersionInfo.DeviceFamilyVersion;
				const version = parseInt(versionStr, 10);
				if (!isNaN(version)) {
					const major = (version / 0x1000000000000) & 0xffff;
					const minor = (version / 0x100000000) & 0xffff;
					const build = (version / 0x10000) & 0xffff;
					this._osVersion = `${major}.${minor}.${build}`;
				} else {
					this._osVersion = versionStr || 'unknown';
				}
			} catch {
				this._osVersion = 'unknown';
			}
		}
		return this._osVersion;
	}

	get model(): string {
		if (!this._model) {
			try {
				this._model = Windows.System.Profile.SystemManufacturerInfo.SmbiosInfo.SystemProductName || 'Windows PC';
			} catch {
				this._model = 'Windows PC';
			}
		}
		return this._model;
	}

	get sdkVersion(): string {
		return this.osVersion;
	}

	get deviceType(): 'Phone' | 'Tablet' {
		const dips = Math.min(Screen.mainScreen.widthPixels, Screen.mainScreen.heightPixels) / Screen.mainScreen.scale;
		return dips >= MIN_TABLET_PIXELS ? 'Tablet' : 'Phone';
	}

	get uuid(): string {
		if (!this._uuid) {
			try {
				const systemId = Windows.System.Profile.SystemIdentification.GetSystemIdForPublisher();
				const buffer = systemId.Id;
				const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
				const bytes = new Uint8Array(buffer.Length);
				reader.ReadBytes(bytes);
				this._uuid = Array.from(bytes)
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			} catch {
				this._uuid = 'windows-' + Math.random().toString(36).substr(2, 9);
			}
		}
		return this._uuid;
	}

	get language(): string {
		try {
			return Windows.Globalization.Language.CurrentInputMethodLanguageTag || 'en';
		} catch {
			return 'en';
		}
	}

	get region(): string {
		try {
			return Windows.System.UserProfile.GlobalizationPreferences.HomeGeographicRegion || 'US';
		} catch {
			return 'US';
		}
	}
}

export const Device = new DeviceRef();

export const device = Device;
