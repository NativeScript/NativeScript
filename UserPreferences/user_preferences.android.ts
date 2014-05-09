import utils_module = require("Utils/utils_android");
import appModule = require("Application/application");

export class UserPreferences {
    private sharedPreferences: any;

    constructor() {
        this.sharedPreferences = appModule.android.context.getSharedPreferences("prefs.db", 0);
    }

    public containsKey(key: string): boolean {
        return this.sharedPreferences.contains(key);
    }

    public getBoolean(key: string, defaultValue?: boolean): boolean {
        if ("undefined" == typeof defaultValue) {
            defaultValue = false;
        }
        return this.sharedPreferences.getBoolean(key, defaultValue);
    }

    public getDouble(key: string, defaultValue?: number): number {
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0.0;
        }
        Log('getting double for key ' + key + ' with default ' + defaultValue + ' result: ' + this.sharedPreferences.getFloat(key, defaultValue));
        return this.sharedPreferences.getFloat(key, defaultValue);
    }

    public getInt(key: string, defaultValue?: number): number {
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0;
        }
        return this.sharedPreferences.getInt(key, defaultValue);
    }

    public getLong(key: string, defaultValue?: number): number {
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0;
        }
        return this.sharedPreferences.getLong(key, defaultValue);
    }

    public getString(key: string, defaultValue?: string): string {
        if ("undefined" == typeof defaultValue) {
            defaultValue = null; // is this ok?
        }
        return this.sharedPreferences.getString(key, defaultValue);
    }

    public getStrings(key: string, defaultValue?: string[]): string[] {
        if ("undefined" == typeof defaultValue) {
            defaultValue = [];
        }
        var hashSet = utils_module.Collections.stringArrayToStringSet(defaultValue);
        var res = this.sharedPreferences.getStringSet(key, hashSet);
        return utils_module.Collections.stringSetToStringArray(res);
    }

    public setBoolean(key: string, value: boolean) {
        var editor = this.sharedPreferences.edit();
        editor.putBoolean(key, value);
        editor.commit();
    }

    public setDouble(key: string, value: number) {
        var editor = this.sharedPreferences.edit();
        Log('setting double for key ' + key + ' with value ' + value);
        editor.putFloat(key, float(value));
        editor.commit();
    }

    public setInt(key: string, value: number) {
        var editor = this.sharedPreferences.edit();
        editor.putInt(key, value);
        editor.commit();
    }

    public setLong(key: string, value: number) {
        var editor = this.sharedPreferences.edit();
        editor.putLong(key, long(value));
        editor.commit();
    }

    public setString(key: string, value: string) {
        var editor = this.sharedPreferences.edit();
        editor.putString(key, value);
        editor.commit();
    }

    public setStrings(key: string, values: string[]) {
        var editor = this.sharedPreferences.edit();
        var hashSet = utils_module.Collections.stringArrayToStringSet(values);
        editor.putStringSet(key, hashSet);
        editor.commit();
    }
}