import observable = require("data/observable");
import localSettings = require("local-settings");
import dialogs = require("ui/dialogs");

var NAME = "settings-name";
var HEIGHT = "settings-height";
var WEIGHT = "settings-weight";
var VIBRATE = "settings-vibrate";
var SOUND = "settings-sound";
var SOUND_VOLUME = "settings-sound-value";

export class SettingsViewModel extends observable.Observable {
    get name(): string {
        return localSettings.getString(NAME, "John Doe");
    }
    set name(value: string) {
        localSettings.setString(NAME, value);
    }

    get height(): string {
        return localSettings.getString(HEIGHT, "180");
    }
    set height(value: string) {
        localSettings.setString(HEIGHT, value);
    }

    get weight(): string {
        return localSettings.getString(WEIGHT, "80");
    }
    set weight(value: string) {
        localSettings.setString(WEIGHT, value);
    }

    get vibrateEnabled(): boolean {
        return localSettings.getBoolean(VIBRATE, true);
    }
    set vibrateEnabled(value: boolean) {
        localSettings.setBoolean(VIBRATE, value);
    }

    get soundEnabled(): boolean {
        return localSettings.getBoolean(SOUND, true);
    }
    set soundEnabled(value: boolean) {
        localSettings.setBoolean(SOUND, value);
    }

    get soundVolume(): number {
        return localSettings.getNumber(SOUND_VOLUME, 100);
    }
    set soundVolume(value: number) {
        localSettings.setNumber(SOUND_VOLUME, value);
    }

    public promptName(args: observable.EventData) {
        dialogs.prompt("Enter your name:", this.name).then((promptResult) => {
            if (promptResult.result) {
                this.set("name", promptResult.text);
            }
        });
    }
}

export var settingsViewModel = new SettingsViewModel();


// Pure JavaScript  code: 
//var observable = require("data/observable");
//var localSettings = require("local-settings");

//var NAME = "settings-name";
//var HEIGHT = "settings-height";
//var WEIGHT = "settings-weight";
//var VIBRATE = "settings-vibrate";
//var SOUND = "settings-sound";
//var SOUND_VOLUME = "settings-sound-value";

//var settings = new observable.Observable();
//Object.defineProperty(settings, "name", {
//    get: function () { return localSettings.getString(NAME, "John Doe"); },
//    set: function (value) { localSettings.setString(NAME, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "height", {
//    get: function () { return localSettings.getString(HEIGHT, "180"); },
//    set: function (value) { localSettings.setString(HEIGHT, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "weight", {
//    get: function () { return localSettings.getString(WEIGHT, "80"); },
//    set: function (value) { localSettings.setString(WEIGHT, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "vibrateEnabled", {
//    get: function () { return localSettings.getBoolean(VIBRATE, true); },
//    set: function (value) { localSettings.setBoolean(VIBRATE, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "soundEnabled", {
//    get: function () { return localSettings.getBoolean(SOUND, true); },
//    set: function (value) { localSettings.setBoolean(SOUND, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "soundVolume", {
//    get: function () { return localSettings.getNumber(SOUND_VOLUME, 100); },
//    set: function (value) { localSettings.setNumber(SOUND_VOLUME, value); },
//    enumerable: true,
//    configurable: true
//});

//settings.promptName = function (args) {
//    dialogs.prompt("Enter your name:", settings.name).then(function (promptResult) {
//        if (promptResult.result) {
//            settings.set("name", promptResult.text);
//        }
//    });
//}

//exports.settingsViewModel = settings;

