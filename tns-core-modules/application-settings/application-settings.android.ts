import * as common from "./application-settings-common";
import { getNativeApplication } from "application";

var sharedPreferences;
function ensureSharedPreferences() {
    if (!sharedPreferences) {
        sharedPreferences = (<android.app.Application>getNativeApplication()).getApplicationContext().getSharedPreferences("prefs.db", 0);
    }
}

function verify(key: string) {
    common.checkKey(key);
    ensureSharedPreferences();
}

export function hasKey(key: string): boolean {
    verify(key);
    return sharedPreferences.contains(key);
}

// getters
export function getBoolean(key: string, defaultValue?: boolean): boolean {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getBoolean(key, false);
    }
    return defaultValue;
}

export function getString(key: string, defaultValue?: string): string {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getString(key, "");
    }
    return defaultValue;
}

export function getNumber(key: string, defaultValue?: number): number {
    verify(key);
    if (hasKey(key)) {
        return sharedPreferences.getFloat(key, float(0.0));
    }
    return defaultValue;
}

// setters
export function setBoolean(key: string, value: boolean): void {
    verify(key);
    common.ensureValidValue(value, "boolean");
    var editor = sharedPreferences.edit();
    editor.putBoolean(key, value);
    editor.commit();
}

export function setString(key: string, value: string): void {
    verify(key);
    common.ensureValidValue(value, "string");
    var editor = sharedPreferences.edit();
    editor.putString(key, value);
    editor.commit();
}

export function setNumber(key: string, value: number): void {
    verify(key);
    common.ensureValidValue(value, "number");
    var editor = sharedPreferences.edit();
    editor.putFloat(key, float(value));
    editor.commit();
}

export function remove(key: string): void {
    verify(key);
    var editor = sharedPreferences.edit();
    editor.remove(key);
    editor.commit();
}

export function clear(): void {
    ensureSharedPreferences();
    sharedPreferences.edit().clear().commit();
}