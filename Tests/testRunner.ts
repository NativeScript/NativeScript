var TKUnit = require("Tests/TKUnit");

var allTests = {};
allTests["FILE SYSTEM"] = require("Tests/file-system-tests");
allTests["HTTP"] = require("Tests/http-tests");
allTests["LOCATION"] = require("Tests/location-tests");
allTests["LOCAL SETTINGS"] = require("Tests/local-settings-tests");
allTests["IMAGE SOURCE"] = require("Tests/image-tests");

export var runAll = function (moduleName?: string) {
    for (var name in allTests) {
        if(moduleName && (moduleName.toLowerCase() !== name.toLowerCase())) {
            continue;
        }

        TKUnit.runTestModule(allTests[name], name);
    }
}
