import observable = require("data/observable");
import localSettings = require("local-settings");

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
}

export var settingsViewModel = new SettingsViewModel();
