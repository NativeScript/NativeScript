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
}

var mainScreenInfo: definition.ScreenMetrics = null;

// This is a "static" class and it is used like a name-space.
// It is not meant to be initialized - thus it is not capitalized
export class screen implements definition.screen {
    static get mainScreen(): definition.ScreenMetrics {
        if (!mainScreenInfo) {
            var mainScreen = UIScreen.mainScreen();
            if (mainScreen) {
                var size = mainScreen.bounds.size;
                var scale = mainScreen.scale;
                mainScreenInfo = {
                    widthPixels: size.width * scale,
                    heightPixels: size.height * scale,
                    scale: scale,
                    widthDIPs: size.width,
                    heightDIPs: size.height
                }
            }
        }
        return mainScreenInfo;
    }
}
