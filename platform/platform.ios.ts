/* tslint:disable:class-name */
import definition = require("platform");
import enums = require("ui/enums");

export module platformNames {
    export var android = "Android";
    export var ios = "iOS";
}

// This is a "static" class and it is used like a name-space.
// It is not meant to be initialized - thus it is not capitalized
export class device implements definition.device {
    private static _model: string;
    private static _osVersion: string;
    private static _sdkVersion: string;
    private static _deviceType: string;
    private static _language: string;
    private static _region: string;

    static get manufacturer(): string {
        return "Apple";
    }

    static get os(): string {
        return platformNames.ios;
    }

    static get osVersion(): string {
        if (!device._osVersion) {
            device._osVersion = UIDevice.currentDevice().systemVersion;
        }

        return device._osVersion;
    }

    static get model(): string {
        if (!device._model) {
            device._model = UIDevice.currentDevice().model;
        }

        return device._model;
    }

    static get sdkVersion(): string {
        if (!device._sdkVersion) {
            device._sdkVersion = UIDevice.currentDevice().systemVersion;
        }

        return device._sdkVersion;
    }

    static get deviceType(): string {
        if (!device._deviceType) {
            if (UIDevice.currentDevice().userInterfaceIdiom === UIUserInterfaceIdiom.UIUserInterfaceIdiomPhone) {
                device._deviceType = enums.DeviceType.Phone;
            }
            else {
                device._deviceType = enums.DeviceType.Tablet;
            }
        }

        return device._deviceType;
    }

    static get uuid(): string {
        var userDefaults = NSUserDefaults.standardUserDefaults();
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

    static get language(): string {
        if (!device._language) {
            var languages = NSLocale.preferredLanguages();
            device._language = languages[0];
        }
        
        return device._language;
    }

    static get region(): string {
        if(!device._region) {
            device._region = NSLocale.currentLocale().objectForKey(NSLocaleCountryCode);
        }

        return device._region;
    }
}

var mainScreen: MainScreen;

// This is a "static" class and it is used like a name-space.
// It is not meant to be initialized - thus it is not capitalized
export class screen implements definition.screen {
    static get mainScreen(): definition.ScreenMetrics {
        if (!mainScreen) {
            mainScreen = new MainScreen(UIScreen.mainScreen());
        }
        return mainScreen;
    }
}

class MainScreen implements definition.ScreenMetrics {
    private _screen: UIScreen;
    constructor(metrics: UIScreen) {
        this._screen = metrics;
    }

    get widthPixels(): number {
        return this.widthDIPs * this.scale;
    }
    get heightPixels(): number {
        return this.heightDIPs * this.scale;
    }
    get scale(): number {
        return this._screen.scale;
    }
    get widthDIPs(): number {
        return this._screen.bounds.size.width;
    }
    get heightDIPs(): number {
        return this._screen.bounds.size.height;
    }
}