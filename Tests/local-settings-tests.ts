// <snippet name="local-settings">
// # Local Settings
// ``` JavaScript
var LocalSettings = require("local-settings");
// ```
// </snippet>
var TKUnit = require("Tests/TKUnit");

var stringKey:string = "stringKey";
var boolKey: string = "boolKey";
var numberKey: string = "numberKey";
var noStringKey: string = "noStringKey";
var noBoolKey: string = "noBoolKey";
var noNumberKey: string = "noNumberKey";

// <snippet name="local-settings">
// ## Working with string, number and boolean values
// </snippet>

export var testBoolean = function () {
    LocalSettings.setBoolean(boolKey, false);
    var boolValue = LocalSettings.getBoolean(boolKey);
    TKUnit.assert(false == boolValue, "Cannot set boolean to false, currently it is: " + LocalSettings.getBoolean(boolKey));

    // <snippet name="local-settings">
    // ### Set and get boolean value and provide default value in case it is not set
    // ``` JavaScript
    LocalSettings.setBoolean("boolKey", true);
    var boolValue = LocalSettings.getBoolean("boolKey", false);
    // ```
    // </snippet>
    TKUnit.assert(true == boolValue, "Cannot set boolean to true");

    TKUnit.assert(true == LocalSettings.getBoolean(boolKey), "Cannot set boolean to true (no default)");
};

export var testString = function () {
    // <snippet name="local-settings">
    // ### Set and get string value
    // ``` JavaScript
    LocalSettings.setString("stringKey", "String value");
    var stringValue = LocalSettings.getString("stringKey");
    // ```
    // </snippet>
    TKUnit.assert("String value" === stringValue, "Cannot set string value");
};

export var testNumber = function () {
    // <snippet name="local-settings">
    // ### Set and get numeric value. We use toFixed() here in order to avoid number based errors
    // ``` JavaScript
    LocalSettings.setNumber("numberKey", 54.321);
    var value = LocalSettings.getNumber("numberKey").toFixed(3);
    // ```
    // </snippet>
    TKUnit.assert(54.321 == value, "Cannot set number value 54.321 != " + value);
};

export var testDefaults = function () {
    // <snippet name="local-settings">
    // ### Reading values that are not set before while providing default value
    // ``` JavaScript
    var defaultValue = LocalSettings.getString("noStringKey", "No string value");
    //// will return "No string value" if there is no value for "noStringKey"
    // ```
    // </snippet>
    TKUnit.assert("No string value" === defaultValue, "Bad default string value");
    TKUnit.assert(true === LocalSettings.getBoolean(noBoolKey, true), "Bad default boolean value");
    TKUnit.assert(123.45 === LocalSettings.getNumber(noNumberKey, 123.45), "Bad default number value");

    // <snippet name="local-settings">
    // ### Reading values that are not set before not providing default value
    // ``` JavaScript
    var defaultValue = LocalSettings.getString("noStringKey");
    //// will return undefined if there is no value for "noStringKey"
    // ```
    // </snippet>
    TKUnit.assert("undefined" === typeof defaultValue, "Default string value is not undefined");
    TKUnit.assert("undefined" === LocalSettings.getBoolean(noBoolKey), "Default boolean value is not undefined");
    TKUnit.assert("undefined" === LocalSettings.getNumber(noNumberKey), "Default number value is not undefined");
};

// <snippet name="local-settings">
// ## Other functions
// </snippet>

export var testHasKey = function () {
    // <snippet name="local-settings">
    // ### Checking for existence of value for key
    // ``` JavaScript
    var hasKey = LocalSettings.hasKey("noBoolKey");
    //// will return false if there is no value for "noBoolKey"
    // ```
    // </snippet>
    TKUnit.assert(!hasKey, "There is a key: " + noBoolKey);
    TKUnit.assert(!LocalSettings.hasKey(noStringKey), "There is a key: " + noStringKey);
    TKUnit.assert(!LocalSettings.hasKey(noNumberKey), "There is a key: " + noNumberKey);

    TKUnit.assert(LocalSettings.hasKey(boolKey), "There is no key: " + boolKey);
    TKUnit.assert(LocalSettings.hasKey(stringKey), "There is no key: " + stringKey);
    TKUnit.assert(LocalSettings.hasKey(numberKey), "There is no key: " + numberKey);
};

export var testRemove = function () {
    // <snippet name="local-settings">
    // ### Removing value for key
    // ``` JavaScript
    LocalSettings.remove("boolKey");
    // ```
    // </snippet>
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
