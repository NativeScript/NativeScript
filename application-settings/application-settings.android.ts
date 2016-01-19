import common = require("./application-settings-common");
import utils = require("utils/utils");

var sharedPreferences;
function ensureSharedPreferences() {
    if (!sharedPreferences) {
        sharedPreferences = utils.ad.getApplicationContext().getSharedPreferences("prefs.db", 0);
    }
}

function verify(key: string) {
    common.checkKey(key);
    ensureSharedPreferences();
}

export var hasKey = function (key: string): boolean {
    verify(key);
    return sharedPreferences.contains(key);
}

// getters
export var getBoolean = function (key: string, defaultValue?: boolean): boolean {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getBoolean(key, false);
    }
    return defaultValue;
}

export var getString = function (key: string, defaultValue?: string): string {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getString(key, "");
    }
    return defaultValue;
}

export var getNumber = function (key: string, defaultValue?: number): number {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getFloat(key, float(0.0));
    }
    return defaultValue;
}

// setters
export var setBoolean = function (key: string, value: boolean): void {
    verify(key);
    common.ensureValidValue(value, "boolean");
    var editor = sharedPreferences.edit();
    editor.putBoolean(key, value);
    editor.commit();
}

export var setString = function (key: string, value: string): void {
    verify(key);
    common.ensureValidValue(value, "string");
    var editor = sharedPreferences.edit();
    editor.putString(key, value);
    editor.commit();
}

export var setNumber = function (key: string, value: number): void {
    verify(key);
    common.ensureValidValue(value, "number");
    var editor = sharedPreferences.edit();
    editor.putFloat(key, float(value));
    editor.commit();
}

export var remove = function (key: string): void {
    verify(key);
    var editor = sharedPreferences.edit();
    editor.remove(key);
    editor.commit();
}
