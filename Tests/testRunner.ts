var TKUnit = require("Tests/TKUnit");

var allTests = {};
allTests["APPLICATION"] = require("Tests/application-tests");
allTests["FILE SYSTEM"] = require("Tests/file-system-tests");
allTests["HTTP"] = require("Tests/http-tests");
allTests["LOCATION"] = require("Tests/location-tests");
allTests["LOCAL SETTINGS"] = require("Tests/local-settings-tests");
allTests["IMAGE SOURCE"] = require("Tests/image-source-tests");
allTests["TIMER"] = require("Tests/timer-tests");

export var runAll = function (moduleName?: string) {
    var totalSuccess = 0;
    var totalFailed = 0;
    for (var name in allTests) {
        if(moduleName && (moduleName.toLowerCase() !== name.toLowerCase())) {
            continue;
        }

        var result = TKUnit.runTestModule(allTests[name], name);
        totalSuccess += result.success;
        totalFailed += result.failed;
    }
    console.info("=== ALL TESTS COMPLETE === " + totalSuccess + " OK, " + totalFailed + " failed")
}
