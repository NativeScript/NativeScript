/* tslint:disable:class-name */
import definition = require("platform");

import * as utils from "utils/utils";

export module platformNames {
    export var android = "Android";
    export var ios = "iOS";
}

class Device implements definition.Device {
    private _model: string;
    private _osVersion: string;
    private _sdkVersion: string;
    private _deviceType: string;
    private _language: string;
    private _region: string;

    get manufacturer(): string {
        return "Apple";
    }

    get os(): string {
        return platformNames.ios;
    }

    get osVersion(): string {
        if (!this._osVersion) {
            this._osVersion = utils.ios.getter(UIDevice, UIDevice.currentDevice).systemVersion;
        }

        return this._osVersion;
    }

    get model(): string {
        if (!this._model) {
            this._model = utils.ios.getter(UIDevice, UIDevice.currentDevice).model;
        }

        return this._model;
    }

    get sdkVersion(): string {
        if (!this._sdkVersion) {
            this._sdkVersion = utils.ios.getter(UIDevice, UIDevice.currentDevice).systemVersion;
        }

        return this._sdkVersion;
    }

    get deviceType(): string {
        if (!this._deviceType) {
            var enums = require("ui/enums");

            if (utils.ios.getter(UIDevice, UIDevice.currentDevice).userInterfaceIdiom === UIUserInterfaceIdiom.Phone) {
                this._deviceType = enums.DeviceType.Phone;
            }
            else {
                this._deviceType = enums.DeviceType.Tablet;
            }
        }

        return this._deviceType;
    }

    get uuid(): string {
        var userDefaults = utils.ios.getter(NSUserDefaults, NSUserDefaults.standardUserDefaults);
        var uuid_key = "TNSUUID";
        var app_uuid = userDefaults.stringForKey(uuid_key);

        if (!app_uuid) {
            var uuidRef = CFUUIDCreate(kCFAllocatorDefault);
            app_uuid = CFUUIDCreateString(kCFAllocatorDefault, uuidRef);
            userDefaults.setObjectForKey(app_uuid, uuid_key);
            userDefaults.synchronize();
        }

        return app_uuid;
    }

    get language(): string {
        if (!this._language) {
            var languages = utils.ios.getter(NSLocale, NSLocale.preferredLanguages);
            this._language = languages[0];
        }
        
        return this._language;
    }

    get region(): string {
        if(!this._region) {
            this._region = utils.ios.getter(NSLocale, NSLocale.currentLocale).objectForKey(NSLocaleCountryCode);
        }

        return this._region;
    }
}

class MainScreen implements definition.ScreenMetrics {
    private _screen: UIScreen;
    private get screen(): UIScreen {
        if (!this._screen) {
            this._screen = utils.ios.getter(UIScreen, UIScreen.mainScreen);
        }

        return this._screen;
    }

    get widthPixels(): number {
        return this.widthDIPs * this.scale;
    }
    get heightPixels(): number {
        return this.heightDIPs * this.scale;
    }
    get scale(): number {
        return this.screen.scale;
    }
    get widthDIPs(): number {
        return this.screen.bounds.size.width;
    }
    get heightDIPs(): number {
        return this.screen.bounds.size.height;
    }
}

export var device: definition.Device = new Device();

export module screen {
    export var mainScreen = new MainScreen();
}

export var isIOS = true;