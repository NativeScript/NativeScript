
var TKUnit = require("TestModules/TKUnit");
var UserPreferences = require("UserPreferences");

var stringKey:string = "stringKey";
var boolKey: string = "boolKey";
var numberKey: string = "numberKey";
var noStringKey: string = "noStringKey";
var noBoolKey: string = "noBoolKey";
var noNumberKey: string = "noNumberKey";

export var testBoolean = function () {
    UserPreferences.setBoolean(boolKey, false);
    TKUnit.assert(false == UserPreferences.getBoolean(boolKey), "Cannot set boolean to false, currently it is: " + UserPreferences.getBoolean(boolKey));

    UserPreferences.setBoolean(boolKey, true);
    TKUnit.assert(true == UserPreferences.getBoolean(boolKey, false), "Cannot set boolean to true");

    TKUnit.assert(true == UserPreferences.getBoolean(boolKey), "Cannot set boolean to true (no default)");
};

export var testString = function () {
    UserPreferences.setString(stringKey, "String value");
    TKUnit.assert("String value" === UserPreferences.getString(stringKey), "Cannot set string value");
};

export var testNumber = function () {
    UserPreferences.setNumber(numberKey, 54.321);
    var value = UserPreferences.getNumber(numberKey).toFixed(3);
    TKUnit.assert(54.321 == value, "Cannot set number value 54.321 != " + value);
};

export var testDefaults = function () {
    TKUnit.assert("No string value" === UserPreferences.getString(noStringKey, "No string value"), "Bad default string value");
    TKUnit.assert(true === UserPreferences.getBoolean(noBoolKey, true), "Bad default boolean value");
    TKUnit.assert(123.45 === UserPreferences.getNumber(noNumberKey, 123.45), "Bad default number value");
};

export var testHasKey = function () {
    TKUnit.assert(!UserPreferences.hasKey(noBoolKey), "There is a key: " + noBoolKey);
    TKUnit.assert(!UserPreferences.hasKey(noStringKey), "There is a key: " + noStringKey);
    TKUnit.assert(!UserPreferences.hasKey(noNumberKey), "There is a key: " + noNumberKey);

    TKUnit.assert(UserPreferences.hasKey(boolKey), "There is no key: " + boolKey);
    TKUnit.assert(UserPreferences.hasKey(stringKey), "There is no key: " + stringKey);
    TKUnit.assert(UserPreferences.hasKey(numberKey), "There is no key: " + numberKey);
};

export var testRemove = function () {
    UserPreferences.remove(boolKey);
    TKUnit.assert(!UserPreferences.hasKey(boolKey), "Failed to remove key: " + boolKey);

    UserPreferences.remove(stringKey);
    TKUnit.assert(!UserPreferences.hasKey(stringKey), "Failed to remove key: " + stringKey);

    UserPreferences.remove(numberKey);
    TKUnit.assert(!UserPreferences.hasKey(numberKey), "Failed to remove key: " + numberKey);
};

export var testInvalidKey = function () {
    try {
        UserPreferences.hasKey(undefined);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.hasKey(null);
        TKUnit.assert(false, "There is a key null");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.hasKey(123);
        TKUnit.assert(false, "There is a key number");
    }
    catch (e) {
        // we should receive an exception here
    }

    UserPreferences.hasKey("string");
};

export var testInvalidValue = function () {
    try {
        UserPreferences.setBoolean(boolKey, "str");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.setBoolean(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.setString(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.setString(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.setNumber(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        UserPreferences.setNumber(boolKey, "123");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

};
