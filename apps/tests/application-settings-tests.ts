// <snippet module="application-settings" title="application-settings">
// # Application Settings
// Using application settings methods requires to load "application settings" module.
// ``` JavaScript
var appSettings = require("application-settings");
// ```
// </snippet>
var TKUnit = require("./TKUnit");

var stringKey:string = "stringKey";
var boolKey: string = "boolKey";
var numberKey: string = "numberKey";
var noStringKey: string = "noStringKey";
var noBoolKey: string = "noBoolKey";
var noNumberKey: string = "noNumberKey";

// <snippet module="application-settings" title="application-settings">
// ## Working with string, number and boolean values
// </snippet>

export var testBoolean = function () {
    appSettings.setBoolean(boolKey, false);
    var boolValueBefore = appSettings.getBoolean(boolKey);
    TKUnit.assert(false === boolValueBefore, "Cannot set boolean to false, currently it is: " + appSettings.getBoolean(boolKey));

    // <snippet module="application-settings" title="application-settings">
    // ### Set and get boolean value and provide default value in case it is not set
    // ``` JavaScript
    appSettings.setBoolean("boolKey", true);
    var boolValue = appSettings.getBoolean("boolKey", false);
    // ```
    // </snippet>
    TKUnit.assert(true === boolValue, "Cannot set boolean to true");

    TKUnit.assert(true === appSettings.getBoolean(boolKey), "Cannot set boolean to true (no default)");
};

export var testString = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Set and get string value
    // ``` JavaScript
    appSettings.setString("stringKey", "String value");
    var stringValue = appSettings.getString("stringKey");
    // ```
    // </snippet>
    TKUnit.assert("String value" === stringValue, "Cannot set string value");
};

export var testNumber = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Set and get numeric value.
    // We use `toFixed()` here in order to avoid floating point errors - ex: `54.321` becoming `54.320999999537`.
    // Beware the result of `toFixed()` is a string not a number therefore you cannot use `===` or `!==` when comparing with a number.
    // ``` JavaScript
    appSettings.setNumber("numberKey", 54.321);
    var value = parseFloat(appSettings.getNumber("numberKey").toFixed(3));
    // ```
    // </snippet>
    TKUnit.assert(54.321 === value, "Cannot set number value 54.321 != " + value);
};

export var testDefaults = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Reading values that are not set before while providing default value
    // ``` JavaScript
    var defaultValue = appSettings.getString("noStringKey", "No string value");
    //// will return "No string value" if there is no value for "noStringKey"
    // ```
    // </snippet>
    TKUnit.assert("No string value" === defaultValue, "Bad default string value");
    TKUnit.assert(true === appSettings.getBoolean(noBoolKey, true), "Bad default boolean value");
    TKUnit.assert(123.45 === appSettings.getNumber(noNumberKey, 123.45), "Bad default number value");
}

export var testDefaultsWithNoDefaultValueProvided = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Reading values that are not set before not providing default value
    // ``` JavaScript
    var defaultValue = appSettings.getString("noStringKey");
    //// will return undefined if there is no value for "noStringKey"
    // ```
    // </snippet>
    TKUnit.assert("undefined" === typeof defaultValue, "Default string value is not undefined");

    TKUnit.assert("undefined" === typeof appSettings.getBoolean(noBoolKey), "Default boolean value is not undefined");
    TKUnit.assert("undefined" === typeof appSettings.getNumber(noNumberKey), "Default number value is not undefined");
};

// <snippet module="application-settings" title="application-settings">
// ## Other functions
// </snippet>

export var testHasKey = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Checking for existence of value for key
    // ``` JavaScript
    var hasKey = appSettings.hasKey("noBoolKey");
    //// will return false if there is no value for "noBoolKey"
    // ```
    // </snippet>
    TKUnit.assert(!hasKey, "There is a key: " + noBoolKey);
    TKUnit.assert(!appSettings.hasKey(noStringKey), "There is a key: " + noStringKey);
    TKUnit.assert(!appSettings.hasKey(noNumberKey), "There is a key: " + noNumberKey);

    TKUnit.assert(appSettings.hasKey(boolKey), "There is no key: " + boolKey);
    TKUnit.assert(appSettings.hasKey(stringKey), "There is no key: " + stringKey);
    TKUnit.assert(appSettings.hasKey(numberKey), "There is no key: " + numberKey);
};

export var testRemove = function () {
    // <snippet module="application-settings" title="application-settings">
    // ### Removing value for key
    // ``` JavaScript
    appSettings.remove("boolKey");
    // ```
    // </snippet>
    TKUnit.assert(!appSettings.hasKey(boolKey), "Failed to remove key: " + boolKey);

    appSettings.remove(stringKey);
    TKUnit.assert(!appSettings.hasKey(stringKey), "Failed to remove key: " + stringKey);

    appSettings.remove(numberKey);
    TKUnit.assert(!appSettings.hasKey(numberKey), "Failed to remove key: " + numberKey);
};

export var testInvalidKey = function () {
    try {
        appSettings.hasKey(undefined);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.hasKey(null);
        TKUnit.assert(false, "There is a key null");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.hasKey(123);
        TKUnit.assert(false, "There is a key number");
    }
    catch (e) {
        // we should receive an exception here
    }

    appSettings.hasKey("string");
};

export var testInvalidValue = function () {
    try {
        appSettings.setBoolean(boolKey, "str");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.setBoolean(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.setString(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.setString(boolKey, 123);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.setNumber(boolKey, true);
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

    try {
        appSettings.setNumber(boolKey, "123");
        TKUnit.assert(false, "There is a key undefined");
    }
    catch (e) {
        // we should receive an exception here
    }

};
