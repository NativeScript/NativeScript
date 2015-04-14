import observable = require("data/observable");
import appSettings = require("application-settings");
import dialogs = require("ui/dialogs");

var NAME = "settings-name";
var HEIGHT = "settings-height";
var WEIGHT = "settings-weight";
var VIBRATE = "settings-vibrate";
var SOUND = "settings-sound";
var SOUND_VOLUME = "settings-sound-value";

export class SettingsViewModel extends observable.Observable {
    get name(): string {
        return appSettings.getString(NAME, "John Doe");
    }
    set name(value: string) {
        appSettings.setString(NAME, value);
    }

    get height(): string {
        return appSettings.getString(HEIGHT, "180");
    }
    set height(value: string) {
        appSettings.setString(HEIGHT, value);
    }

    get weight(): string {
        return appSettings.getString(WEIGHT, "80");
    }
    set weight(value: string) {
        appSettings.setString(WEIGHT, value);
    }

    get vibrateEnabled(): boolean {
        return appSettings.getBoolean(VIBRATE, true);
    }
    set vibrateEnabled(value: boolean) {
        appSettings.setBoolean(VIBRATE, value);
    }

    get soundEnabled(): boolean {
        return appSettings.getBoolean(SOUND, true);
    }
    set soundEnabled(value: boolean) {
        appSettings.setBoolean(SOUND, value);
    }

    get soundVolume(): number {
        return appSettings.getNumber(SOUND_VOLUME, 100);
    }
    set soundVolume(value: number) {
        appSettings.setNumber(SOUND_VOLUME, value);
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
//var appSettings = require("application-settings");

//var NAME = "settings-name";
//var HEIGHT = "settings-height";
//var WEIGHT = "settings-weight";
//var VIBRATE = "settings-vibrate";
//var SOUND = "settings-sound";
//var SOUND_VOLUME = "settings-sound-value";

//var settings = new observable.Observable();
//Object.defineProperty(settings, "name", {
//    get: function () { return appSettings.getString(NAME, "John Doe"); },
//    set: function (value) { appSettings.setString(NAME, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "height", {
//    get: function () { return appSettings.getString(HEIGHT, "180"); },
//    set: function (value) { appSettings.setString(HEIGHT, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "weight", {
//    get: function () { return appSettings.getString(WEIGHT, "80"); },
//    set: function (value) { appSettings.setString(WEIGHT, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "vibrateEnabled", {
//    get: function () { return appSettings.getBoolean(VIBRATE, true); },
//    set: function (value) { appSettings.setBoolean(VIBRATE, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "soundEnabled", {
//    get: function () { return appSettings.getBoolean(SOUND, true); },
//    set: function (value) { appSettings.setBoolean(SOUND, value); },
//    enumerable: true,
//    configurable: true
//});

//Object.defineProperty(settings, "soundVolume", {
//    get: function () { return appSettings.getNumber(SOUND_VOLUME, 100); },
//    set: function (value) { appSettings.setNumber(SOUND_VOLUME, value); },
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

