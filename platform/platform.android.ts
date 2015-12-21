/* tslint:disable:class-name */
import definition = require("platform");
import utils = require("utils/utils");
import * as enumsModule from "ui/enums";

export module platformNames {
    export var android = "Android";
    export var ios = "iOS";
}

// This is a "static" class and it is used like a name-space.
// It is not meant to be initialized - thus it is not capitalized
export class device implements definition.device {
    private static MIN_TABLET_PIXELS = 600;
    private static _manufacturer: string;
    private static _model: string;
    private static _osVersion: string;
    private static _sdkVersion: string;
    private static _deviceType: string;
    private static _uuid: string;
    private static _language: string;
    private static _region: string;

    static get os(): string {
        return platformNames.android;
    }

    static get manufacturer(): string {
        if (!device._manufacturer) {
            device._manufacturer = android.os.Build.MANUFACTURER;
        }

        return device._manufacturer;
    }

    static get osVersion(): string {
        if (!device._osVersion) {
            device._osVersion = android.os.Build.VERSION.RELEASE;
        }

        return device._osVersion;
    }

    static get model(): string {
        if (!device._model) {
            device._model = android.os.Build.MODEL;
        }

        return device._model;
    }

    static get sdkVersion(): string {
        if (!device._sdkVersion) {
            device._sdkVersion = android.os.Build.VERSION.SDK;
        }

        return device._sdkVersion;
    }

    static get deviceType(): string {
        if (!device._deviceType) {
            var dips = Math.min(screen.mainScreen.widthPixels, screen.mainScreen.heightPixels) / screen.mainScreen.scale;
            var enums: typeof enumsModule = require("ui/enums");

            // If the device has more than 600 dips it is considered to be a tablet.
            if (dips >= device.MIN_TABLET_PIXELS) {
                device._deviceType = enums.DeviceType.Tablet;
            }
            else {
                device._deviceType = enums.DeviceType.Phone;
            }
        }

        return device._deviceType;
    }

    static get uuid(): string {
        if (!device._uuid) {
            device._uuid = android.provider.Settings.Secure.getString(
                utils.ad.getApplicationContext().getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID
                );
        }

        return device._uuid;
    }

    static get language(): string {
        if (!device._language) {
            device._language = java.util.Locale.getDefault().getLanguage().replace("_", "-");
        }

        return device._language;
    }

    static get region(): string {
        if(!device._region) {
            device._region = java.util.Locale.getDefault().getCountry();
        }

        return device._region;
    }
}

var mainScreen: MainScreen;

// This is a "static" class and it is used like a namespace.
// It is not meant to be initialized - thus it is not capitalized
export class screen implements definition.screen {
    static get mainScreen(): definition.ScreenMetrics {
        if (!mainScreen) {
            var metrics = utils.ad.getApplicationContext().getResources().getDisplayMetrics();
            mainScreen = new MainScreen(metrics);
        }
        return mainScreen;
    }
}

class MainScreen implements definition.ScreenMetrics {
    private _metrics: android.util.DisplayMetrics;
    constructor(metrics: android.util.DisplayMetrics) {
        this._metrics = metrics;
    }

    get widthPixels(): number {
        return this._metrics.widthPixels;
    }
    get heightPixels(): number {
        return this._metrics.heightPixels;
    }
    get scale(): number {
        return this._metrics.density;
    }
    get widthDIPs(): number {
        return this._metrics.widthPixels / this._metrics.density;
    }
    get heightDIPs(): number {
        return this._metrics.heightPixels / this._metrics.density;
    }
}