/* tslint:disable:class-name */
import { Device as DeviceDefinition, ScreenMetrics as ScreenMetricsDefinition } from "platform";
import * as appModule from "application";

const MIN_TABLET_PIXELS = 600;

export module platformNames {
    export const android = "Android";
    export const ios = "iOS";
}

class Device implements DeviceDefinition {
    private _manufacturer: string;
    private _model: string;
    private _osVersion: string;
    private _sdkVersion: string;
    private _deviceType: "Phone" | "Tablet";
    private _uuid: string;
    private _language: string;
    private _region: string;

    get os(): string {
        return platformNames.android;
    }

    get manufacturer(): string {
        if (!this._manufacturer) {
            this._manufacturer = android.os.Build.MANUFACTURER;
        }

        return this._manufacturer;
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

    get deviceType(): "Phone" | "Tablet" {
        if (!this._deviceType) {
            const dips = Math.min(screen.mainScreen.widthPixels, screen.mainScreen.heightPixels) / screen.mainScreen.scale;
            // If the device has more than 600 dips it is considered to be a tablet.
            if (dips >= MIN_TABLET_PIXELS) {
                this._deviceType = "Tablet";
            }
            else {
                this._deviceType = "Phone";
            }
        }

        return this._deviceType;
    }

    get uuid(): string {
        if (!this._uuid) {
            const nativeApp = <android.app.Application>appModule.android.nativeApp;
            this._uuid = android.provider.Settings.Secure.getString(
                nativeApp.getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID
            );
        }

        return this._uuid;
    }

    get language(): string {
        if (!this._language) {
            this._language = java.util.Locale.getDefault().getLanguage().replace("_", "-");
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

class MainScreen implements ScreenMetricsDefinition {
    private _metrics: android.util.DisplayMetrics;

    constructor() {
        // NOTE: This will be memory leak but we MainScreen is singleton
        appModule.on("cssChanged", this.cssChanged, this);
    }

    private cssChanged(args: appModule.CssChangedEventData): void {
        if (!this._metrics) {
            this._metrics = new android.util.DisplayMetrics();
        }
        this.initMetrics();
    }

    private initMetrics(): void {
        const nativeApp = <android.app.Application>appModule.getNativeApplication();
        nativeApp.getSystemService(android.content.Context.WINDOW_SERVICE).getDefaultDisplay().getRealMetrics(this._metrics);
    }

    private get metrics(): android.util.DisplayMetrics {
        if (!this._metrics) {
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

export const device = new Device();

export module screen {
    export const mainScreen = new MainScreen();
}

export const isAndroid = true;