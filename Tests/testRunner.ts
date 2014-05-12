var TKUnit = require("Tests/TKUnit");
var fsTests = require("Tests/file_system_tests");
var httpTests = require("Tests/http_tests");
var locationTests = require("Tests/location_tests");
var userPreferencesTests = require("Tests/user_preferences_tests");

export var runAll = function () {
    TKUnit.runTestModule(fsTests, "FILE SYSTEM");
    TKUnit.runTestModule(httpTests, "HTTP");
    TKUnit.runTestModule(locationTests, "LOCATION");
    TKUnit.runTestModule(userPreferencesTests, "USER PREFERENCES");
}
