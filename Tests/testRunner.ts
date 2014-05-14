var TKUnit = require("Tests/TKUnit");
var fsTests = require("Tests/file_system_tests");
var httpTests = require("Tests/http_tests");
var locationTests = require("Tests/location_tests");
var localSettingsTests = require("Tests/local_settings_tests");
var imageTests = require("Tests/image-tests");

export var runAll = function () {
    TKUnit.runTestModule(imageTests, "IMAGE");
    TKUnit.runTestModule(fsTests, "FILE SYSTEM");
    TKUnit.runTestModule(httpTests, "HTTP");
    TKUnit.runTestModule(locationTests, "LOCATION");
    TKUnit.runTestModule(localSettingsTests, "LOCAL SETTINGS");
}
