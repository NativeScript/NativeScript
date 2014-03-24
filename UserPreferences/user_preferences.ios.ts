import utils_module = require("Utils/utils_ios"); 

export class UserPreferences {

    private userDefaults: any;

    constructor() {
        this.userDefaults = Foundation.NSUserDefaults.standardUserDefaults();
    }

    public containsKey(key: string): boolean {
        // FIXME: is there a better way to do this check?
        return this.userDefaults.objectForKey(key) ? true : false;
    }

    public getBoolean(key: string, defaultValue?: boolean): boolean {
        if (this.containsKey(key)) {
            return this.userDefaults.boolForKey(key);
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = false;
        }
        return defaultValue;
    }

    public getDouble(key: string, defaultValue?: number): number {
        if (this.containsKey(key)) {
            return this.userDefaults.doubleForKey(key);
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0.0;
        }
        return defaultValue;
    }

    public getInt(key: string, defaultValue?: number): number {
        if (this.containsKey(key)) {
            return this.userDefaults.integerForKey(key);
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0;
        }
        return defaultValue;
    }

    public getLong(key: string, defaultValue?: number): number {
        if (this.containsKey(key)) {
            return this.userDefaults.integerForKey(key);
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = 0;
        }
        return defaultValue;
    }

    public getString(key: string, defaultValue?: string): string {
        if (this.containsKey(key)) {
            return this.userDefaults.stringForKey(key);
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = "";
        }
        return defaultValue;
    }

    public getStrings(key: string, defaultValue?: string[]): string[] {
        if (this.containsKey(key)) {
            var nsArray = this.userDefaults.stringArrayForKey(key);
            var jsArray = utils_module.tk.utils.Collections.nsArrayToJSArray(nsArray);
            return jsArray;
        }
        if ("undefined" == typeof defaultValue) {
            defaultValue = [];
        }
        return defaultValue;
    }

    public setBoolean(key: string, value: boolean) {
        this.userDefaults.setBoolForKey(value, key);
        this.userDefaults.synchronize();
    }

    public setDouble(key: string, value: number) {
        this.userDefaults.setDoubleForKey(value, key);
        this.userDefaults.synchronize();
    }

    public setInt(key: string, value: number) {
        this.userDefaults.setIntegerForKey(value, key);
        this.userDefaults.synchronize();
    }

    public setLong(key: string, value: number) {
        this.userDefaults.setIntegerForKey(value, key);
        this.userDefaults.synchronize();
    }

    public setString(key: string, value: string) {
        this.userDefaults.setObjectForKey(value, key);
        this.userDefaults.synchronize();
    }

    public setStrings(key: string, values: string[]) {
        var nsArray = utils_module.tk.utils.Collections.jsArrayToNSArray(values);
        this.userDefaults.setObjectForKey(nsArray, key);
        this.userDefaults.synchronize();
    }
}