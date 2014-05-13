import appModule = require("application/application");
import Common = require("localsettings/local_settings_common");

var sharedPreferences = appModule.android.context.getSharedPreferences("prefs.db", 0);

export var hasKey = function (key: string): boolean {
    Common.checkKey(key);
    return sharedPreferences.contains(key);
}

// getters
export var getBoolean = function (key: string, defaultValue?: boolean): boolean {
    Common.checkKey(key);
    if (hasKey(key)) {
        return sharedPreferences.getBoolean(key, false);
    }
    return defaultValue;
}

export var getString = function(key: string, defaultValue?: string): string {
    Common.checkKey(key);
    if (hasKey(key)) {
        return sharedPreferences.getString(key, "");
    }
    return defaultValue;
}

export var getNumber = function(key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return sharedPreferences.getFloat(key, float(0.0));
    }
    return defaultValue;
}

// setters
export var setBoolean = function(key: string, value: boolean): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "boolean");
    var editor = sharedPreferences.edit();
    editor.putBoolean(key, value);
    editor.commit();
}

export var setString = function(key: string, value: string): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "string");
    var editor = sharedPreferences.edit();
    editor.putString(key, value);
    editor.commit();
}

export var setNumber = function(key: string, value: number): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "number");
    var editor = sharedPreferences.edit();
    editor.putFloat(key, float(value));
    editor.commit();
}

export var remove = function (key: string): void {
    Common.checkKey(key);
    var editor = sharedPreferences.edit();
    editor.remove(key);
    editor.commit();
}

/*
these are commented out to be used only if requested by users or otherwise needed

import utils_module = require("Utils/utils_android");

export var getStringArray = function (key: string, defaultValue?: string[]): string[]{
    Common.checkKey(key);
    if (!hasKey(key)) {
        return defaultValue;
    }
    if (!defaultValue) {
        defaultValue = [];
    }
    var hashSet = utils_module.Collections.stringArrayToStringSet(defaultValue);
    var res = sharedPreferences.getStringSet(key, hashSet);
    return utils_module.Collections.stringSetToStringArray(res);
}

export var getInt = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return sharedPreferences.getInt(key, 0);
    }
    return defaultValue;
}

export var getLong = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return sharedPreferences.getLong(key, long(0));
    }
    return defaultValue;
}

export var setStringArray = function (key: string, values: string[]): void {
    Common.checkKey(key);
    var editor = sharedPreferences.edit();
    var hashSet = utils_module.Collections.stringArrayToStringSet(values);
    editor.putStringSet(key, hashSet);
    editor.commit();
}

export var setInt = function (key: string, value: number): void {
    Common.checkKey(key);
    var editor = sharedPreferences.edit();
    editor.putInt(key, value);
    editor.commit();
}

export var setLong = function (key: string, value: number): void {
    Common.checkKey(key);
    var editor = sharedPreferences.edit();
    editor.putLong(key, long(value));
    editor.commit();
}

*/