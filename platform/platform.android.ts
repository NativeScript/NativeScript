/* tslint:disable:class-name */
import definition = require("platform");
import utils = require("utils/utils");
import * as enumsModule from "ui/enums";

const MIN_TABLET_PIXELS = 600;

export module platformNames {
    export var android = "Android";
    export var ios = "iOS";
}

class Device implements definition.Device {
    private _manufacturer: string;
    private _model: string;
    private _osVersion: string;
    private _sdkVersion: string;
    private _deviceType: string;
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

    get deviceType(): string {
        if (!this._deviceType) {
            var dips = Math.min(screen.mainScreen.widthPixels, screen.mainScreen.heightPixels) / screen.mainScreen.scale;
            var enums: typeof enumsModule = require("ui/enums");

            // If the device has more than 600 dips it is considered to be a tablet.
            if (dips >= MIN_TABLET_PIXELS) {
                this._deviceType = enums.DeviceType.Tablet;
            }
            else {
                this._deviceType = enums.DeviceType.Phone;
            }
        }

        return this._deviceType;
    }

    get uuid(): string {
        if (!this._uuid) {
            this._uuid = android.provider.Settings.Secure.getString(
                utils.ad.getApplicationContext().getContentResolver(),
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
        if(!this._region) {
            this._region = java.util.Locale.getDefault().getCountry();
        }

        return this._region;
    }
}

class MainScreen implements definition.ScreenMetrics {
    private _metrics: android.util.DisplayMetrics;
    private get metrics(): android.util.DisplayMetrics {
        if (!this._metrics) {
            this._metrics = utils.ad.getApplicationContext().getResources().getDisplayMetrics();
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

export var device: definition.Device = new Device();

export module screen {
    export var mainScreen = new MainScreen();
}
