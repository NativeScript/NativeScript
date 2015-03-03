import appModule = require("application");
import Common = require("local-settings/local-settings-common");

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