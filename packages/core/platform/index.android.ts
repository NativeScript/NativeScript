/* tslint:disable:class-name */
import { getNativeApplication, on, off, orientationChangedEvent, android as AndroidApplication } from '../application';

const MIN_TABLET_PIXELS = 600;

export const platformNames = {
	android: 'Android',
	ios: 'iOS',
};

class MainScreen {
	private _metrics: android.util.DisplayMetrics;

	private reinitMetrics(): void {
		if (!this._metrics) {
			this._metrics = new android.util.DisplayMetrics();
		}
		this.initMetrics();
	}

	private initMetrics(): void {
		const nativeApp = <android.app.Application>getNativeApplication();
		nativeApp.getSystemService(android.content.Context.WINDOW_SERVICE).getDefaultDisplay().getRealMetrics(this._metrics);
	}

	private get metrics(): android.util.DisplayMetrics {
		if (!this._metrics) {
			// NOTE: This will be memory leak but we MainScreen is singleton
			on('cssChanged', this.reinitMetrics, this);
			on(orientationChangedEvent, this.reinitMetrics, this);

			this._metrics = new android.util.DisplayMetrics();
			this.initMetrics();
		}

		return this._metrics;
	}

	get widthPixels(): number {
		return this.metrics.widthPixels;
	}
	get heightPixels(): number {
		return this.metrics.heightPixels;
	}
	get scale(): number {
		return this.metrics.density;
	}
	get widthDIPs(): number {
		return this.metrics.widthPixels / this.metrics.density;
	}
	get heightDIPs(): number {
		return this.metrics.heightPixels / this.metrics.density;
	}
}

export class Screen {
	static mainScreen = new MainScreen();
}

class DeviceRef {
	private _manufacturer: string;
	private _model: string;
	private _osVersion: string;
	private _sdkVersion: string;
	private _deviceType: 'Phone' | 'Tablet';
	private _uuid: string;
	private _language: string;
	private _region: string;

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
			const nativeApp = <android.app.Application>AndroidApplication.nativeApp;
			this._uuid = android.provider.Settings.Secure.getString(nativeApp.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
		}

		return this._uuid;
	}

	get language(): string {
		if (!this._language) {
			this._language = java.util.Locale.getDefault().getLanguage().replace('_', '-');
		}

		return this._language;
	}

	get region(): string {
		if (!this._region) {
			this._region = java.util.Locale.getDefault().getCountry();
		}

		return this._region;
	}
}

export const Device = new DeviceRef();

export const isAndroid = global.isAndroid;
export const isIOS = global.isIOS;
