
var TKUnit = require("Tests/TKUnit");
var LocalSettings = require("local-settings");

var stringKey:string = "stringKey";
var boolKey: string = "boolKey";
var numberKey: string = "numberKey";
var noStringKey: string = "noStringKey";
var noBoolKey: string = "noBoolKey";
var noNumberKey: string = "noNumberKey";

export var testBoolean = function () {
    LocalSettings.setBoolean(boolKey, false);
    TKUnit.assert(false == LocalSettings.getBoolean(boolKey), "Cannot set boolean to false, currently it is: " + LocalSettings.getBoolean(boolKey));

    LocalSettings.setBoolean(boolKey, true);
    TKUnit.assert(true == LocalSettings.getBoolean(boolKey, false), "Cannot set boolean to true");

    TKUnit.assert(true == LocalSettings.getBoolean(boolKey), "Cannot set boolean to true (no default)");
};

export var testString = function () {
    LocalSettings.setString(stringKey, "String value");
    TKUnit.assert("String value" === LocalSettings.getString(stringKey), "Cannot set string value");
};

export var testNumber = function () {
    LocalSettings.setNumber(numberKey, 54.321);
    var value = LocalSettings.getNumber(numberKey).toFixed(3);
    TKUnit.assert(54.321 == value, "Cannot set number value 54.321 != " + value);
};

export var testDefaults = function () {
    TKUnit.assert("No string value" === LocalSettings.getString(noStringKey, "No string value"), "Bad default string value");
    TKUnit.assert(true === LocalSettings.getBoolean(noBoolKey, true), "Bad default boolean value");
    TKUnit.assert(123.45 === LocalSettings.getNumber(noNumberKey, 123.45), "Bad default number value");
};

export var testHasKey = function () {
    TKUnit.assert(!LocalSettings.hasKey(noBoolKey), "There is a key: " + noBoolKey);
    TKUnit.assert(!LocalSettings.hasKey(noStringKey), "There is a key: " + noStringKey);
    TKUnit.assert(!LocalSettings.hasKey(noNumberKey), "There is a key: " + noNumberKey);

    TKUnit.assert(LocalSettings.hasKey(boolKey), "There is no key: " + boolKey);
    TKUnit.assert(LocalSettings.hasKey(stringKey), "There is no key: " + stringKey);
    TKUnit.assert(LocalSettings.hasKey(numberKey), "There is no key: " + numberKey);
};

export var testRemove = function () {
    LocalSettings.remove(boolKey);
    TKUnit.assert(!LocalSettings.hasKey(boolKey), "Failed to remove key: " + boolKey);

    LocalSettings.remove(stringKey);
    TKUnit.assert(!LocalSettings.hasKey(stringKey), "Failed to remove key: " + stringKey);

    LocalSettings.remove(numberKey);
    TKUnit.assert(!LocalSettings.hasKey(numberKey), "Failed to remove key: " + numberKey);
};

export var testInvalidKey = function () {
    try {
        LocalSettings.hasKey(undefined);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.hasKey(null);
        TKUnit.assert(false, "There is a key null");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.hasKey(123);
        TKUnit.assert(false, "There is a key number");
    }
    catch (e) {
        // we should receive an exception here
    }

    LocalSettings.hasKey("string");
};

export var testInvalidValue = function () {
    try {
        LocalSettings.setBoolean(boolKey, "str");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.setBoolean(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.setString(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.setString(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.setNumber(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        LocalSettings.setNumber(boolKey, "123");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

};
