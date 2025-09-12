import { getNativeApp } from '../../application/helpers-common';
import { SDK_VERSION } from '../../utils/constants';
import { platformNames } from '../common';
import { Screen } from '../screen';

const MIN_TABLET_PIXELS = 600;

class DeviceRef {
	private _manufacturer: string;
	private _model: string;
	private _osVersion: string;
	private _sdkVersion: string;
	private _deviceType: 'Phone' | 'Tablet';
	private _uuid: string;

	get manufacturer(): string {
		if (!this._manufacturer) {
			this._manufacturer = android.os.Build.MANUFACTURER;
		}

		return this._manufacturer;
	}

	get os(): string {
		return platformNames.android;
	}

	get osVersion(): string {
		if (!this._osVersion) {
			this._osVersion = android.os.Build.VERSION.RELEASE;
		}

		return this._osVersion;
	}

	get model(): string {
		if (!this._model) {
			this._model = android.os.Build.MODEL;
		}

		return this._model;
	}

	get sdkVersion(): string {
		if (!this._sdkVersion) {
			this._sdkVersion = android.os.Build.VERSION.SDK;
		}

		return this._sdkVersion;
	}

	get deviceType(): 'Phone' | 'Tablet' {
		if (!this._deviceType) {
			const dips = Math.min(Screen.mainScreen.widthPixels, Screen.mainScreen.heightPixels) / Screen.mainScreen.scale;
			// If the device has more than 600 dips it is considered to be a tablet.
			if (dips >= MIN_TABLET_PIXELS) {
				this._deviceType = 'Tablet';
			} else {
				this._deviceType = 'Phone';
			}
		}

		return this._deviceType;
	}

	get uuid(): string {
		if (!this._uuid) {
			const nativeApp = getNativeApp() as android.app.Application;
			this._uuid = android.provider.Settings.Secure.getString(nativeApp.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
		}

		return this._uuid;
	}

	get language(): string {
		let defaultNativeLocale;
		if (SDK_VERSION >= 24) {
			defaultNativeLocale = android.content.res.Resources.getSystem().getConfiguration().getLocales().get(0);
		} else {
			defaultNativeLocale = android.content.res.Resources.getSystem().getConfiguration().locale;
		}
		return defaultNativeLocale.getLanguage().replace('_', '-');
	}

	get region(): string {
		let defaultNativeLocale;
		if (SDK_VERSION >= 24) {
			defaultNativeLocale = android.content.res.Resources.getSystem().getConfiguration().getLocales().get(0);
		} else {
			defaultNativeLocale = android.content.res.Resources.getSystem().getConfiguration().locale;
		}
		return defaultNativeLocale.getCountry();
	}
}

export const Device = new DeviceRef();

// This retains compatibility with NS6
export const device = Device;
