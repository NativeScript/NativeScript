var TKUnit = require("Tests/TKUnit");
var fsTests = require("Tests/file-system-tests");
var httpTests = require("Tests/http-tests");
var locationTests = require("Tests/location-tests");
var localSettingsTests = require("Tests/local-settings-tests");
var imageTests = require("Tests/image-tests");

export var runAll = function () {
    TKUnit.runTestModule(imageTests, "IMAGE");
    TKUnit.runTestModule(fsTests, "FILE SYSTEM");
    TKUnit.runTestModule(httpTests, "HTTP");
    TKUnit.runTestModule(locationTests, "LOCATION");
    TKUnit.runTestModule(localSettingsTests, "LOCAL SETTINGS");
}
