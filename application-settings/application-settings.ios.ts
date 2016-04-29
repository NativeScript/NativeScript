import Common = require("./application-settings-common");

var userDefaults = NSUserDefaults.standardUserDefaults();

export var hasKey = function (key: string): boolean {
    Common.checkKey(key);
    return userDefaults.objectForKey(key) !== null;
}

// getters
export var getBoolean = function (key: string, defaultValue?: boolean): boolean {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.boolForKey(key);
    }
    return defaultValue;
}

export var getString = function (key: string, defaultValue?: string): string {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.stringForKey(key);
    }
    return defaultValue;
}

export var getNumber = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.doubleForKey(key);
    }
    return defaultValue;
}

// setters
export var setBoolean = function (key: string, value: boolean): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "boolean");
    userDefaults.setBoolForKey(value, key);
    userDefaults.synchronize();
}

export var setString = function (key: string, value: string): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "string");
    userDefaults.setObjectForKey(value, key);
    userDefaults.synchronize();
}

export var setNumber = function (key: string, value: number): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "number");
    userDefaults.setDoubleForKey(value, key);
    userDefaults.synchronize();
}

export var remove = function (key: string): void {
    Common.checkKey(key);
    userDefaults.removeObjectForKey(key);
    userDefaults.synchronize();
}

export var clear = function (): void {
    userDefaults.removePersistentDomainForName(NSBundle.mainBundle().bundleIdentifier);
}
