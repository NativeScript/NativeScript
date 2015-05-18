/* tslint:disable */
import TKUnit = require("./TKUnit");
import trace = require("trace");
import frameModule = require("ui/frame");
import platform = require("platform");
import uiTestModule = require("./ui-test");

frameModule.Frame.defaultAnimatedNavigation = false;

function isRunningOnEmulator(): boolean {
    // This checks are not good enough to be added to modules but keeps unittests green.

    if (platform.device.os === platform.platformNames.android) {
        return android.os.Build.FINGERPRINT.indexOf("generic") > -1 ||
            android.os.Build.HARDWARE.toLowerCase() === "goldfish" ||
            android.os.Build.HARDWARE.toLowerCase() === "donatello" || // VS Emulator
            android.os.Build.PRODUCT.toLocaleLowerCase().indexOf("sdk") > -1 ||
            android.os.Build.PRODUCT.toLocaleLowerCase().indexOf("emulator") > -1; // VS Emulator
    }
    else if (platform.device.os === platform.platformNames.ios) {
        return platform.device.model === "iPhone Simulator";
    }
}

export var allTests = {};
allTests["APPLICATION"] = require("./application-tests");
allTests["DOCKLAYOUT"] = require("./layouts/dock-layout-tests");
allTests["WRAPLAYOUT"] = require("./layouts/wrap-layout-tests");
allTests["ABSOLUTELAYOUT"] = require("./layouts/absolute-layout-tests");
allTests["GRIDLAYOUT"] = require("./layouts/grid-layout-tests");
allTests["STACKLAYOUT"] = require("./layouts/stack-layout-tests");
allTests["PLATFORM"] = require("./platform-tests");
allTests["STYLE-PROPERTIES"] = require("./ui/style/style-properties-tests");
allTests["SCROLL-VIEW"] = require("./ui/scroll-view/scroll-view-tests");
allTests["FILE SYSTEM"] = require("./file-system-tests");
allTests["HTTP"] = require("./http-tests");
allTests["APPLICATION SETTINGS"] = require("./application-settings-tests");
allTests["IMAGE SOURCE"] = require("./image-source-tests");
allTests["TIMER"] = require("./timer-tests");
allTests["COLOR"] = require("./color-tests");
allTests["OBSERVABLE-ARRAY"] = require("./observable-array-tests");
allTests["VIRTUAL-ARRAY"] = require("./virtual-array-tests");
allTests["OBSERVABLE"] = require("./ui/observable-tests");
allTests["DEPENDENCY-OBSERVABLE"] = require("./ui/dependency-observable-tests");
allTests["BINDABLE"] = require("./ui/bindable-tests");
allTests["XML-PARSER"] = require("./xml-parser-tests/xml-parser-tests");
allTests["VIEW"] = require("./ui/view/view-tests");
allTests["STYLE"] = require("./ui/style/style-tests");
allTests["VISUAL-STATE"] = require("./ui/style/visual-state-tests");
allTests["VALUE-SOURCE"] = require("./ui/style/value-source-tests");
allTests["BUTTON"] = require("./ui/button/button-tests");
allTests["LABEL"] = require("./ui/label/label-tests");
allTests["TAB-VIEW"] = require("./ui/tab-view/tab-view-tests");
allTests["IMAGE"] = require("./ui/image/image-tests");
allTests["SLIDER"] = require("./ui/slider/slider-tests");
allTests["SWITCH"] = require("./ui/switch/switch-tests");
allTests["PROGRESS"] = require("./ui/progress/progress-tests");
allTests["PAGE"] = require("./ui/page/page-tests");
allTests["LISTVIEW"] = require("./ui/list-view/list-view-tests");
allTests["ACTIVITY-INDICATOR"] = require("./ui/activity-indicator/activity-indicator-tests");
allTests["TEXT-FIELD"] = require("./ui/text-field/text-field-tests");
allTests["TEXT-VIEW"] = require("./ui/text-view/text-view-tests");
allTests["FORMATTEDSTRING"] = require("./text/formatted-string-tests");
allTests["FILE-SYSTEM-ACCESS"] = require("./file-system-access-tests/file-system-access-tests");
allTests["FILE-NAME-RESOLVER"] = require("./file-name-resolver-tests/file-name-resolver-tests");
allTests["XML-DECLARATION"] = require("./xml-declaration/xml-declaration-tests");
allTests["LIST-PICKER"] = require("./ui/list-picker/list-picker-tests");
allTests["DATE-PICKER"] = require("./ui/date-picker/date-picker-tests");
allTests["TIME-PICKER"] = require("./ui/time-picker/time-picker-tests");
allTests["WEB-VIEW"] = require("./ui/web-view/web-view-tests");
allTests["WEAK-EVENTS"] = require("./weak-event-listener-tests");

if (!isRunningOnEmulator()) {
    allTests["LOCATION"] = require("./location-tests");
}

import utils = require("utils/utils");
var density = utils.layout.getDisplayDensity();
utils.layout.getDisplayDensity = function () {
    return Math.round(density * 100) / 100;
}

var testsWithLongDelay = {
    testLocation: 10000,
    testLocationOnce: 10000,
    testLocationOnceMaximumAge: 10000,
    //web-view-tests
    testLoadExistingUrl: 10000,
    testLoadInvalidUrl: 10000,
}

var running = false;
var testsQueue = new Array<TestInfo>();

function printRunTestStats() {
    var j;
    var testsCount = 0;
    var failedTestCount = 0;
    var failedTestInfo = [];
    for (j = 0; j < testsQueue.length; j++) {
        if (testsQueue[j].isTest) {
            testsCount++;
            if (!testsQueue[j].isPassed) {
                failedTestCount++;
                failedTestInfo.push(testsQueue[j].testName + " FAILED: " + testsQueue[j].errorMessage);
            }
        }
    }
    TKUnit.write("=== ALL TESTS COMPLETE === " + (testsCount - failedTestCount) + " OK, " + failedTestCount + " failed", trace.messageType.info);
    for (j = 0; j < failedTestInfo.length; j++) {
        TKUnit.write(failedTestInfo[j], trace.messageType.error);
    }
}

export var runAll = function (moduleName?: string) {
    if (running) {
        // TODO: We may schedule pending run requests
        return;
    }

    var totalSuccess = 0;
    var totalFailed: Array<TKUnit.TestFailure> = [];
    testsQueue.push(new TestInfo(function () { running = true; }));
    for (var name in allTests) {
        if (moduleName && (moduleName.toLowerCase() !== name.toLowerCase())) {
            continue;
        }

        var testModule = allTests[name];
        //var moduleStart = function (moduleName) {
        //    return function () {
        //        TKUnit.write("--- " + moduleName + " TESTS BEGIN ---", trace.messageType.info);
        //    }
        //};
        //testsQueue.push(new TestInfo(moduleStart(name)));

        var test = testModule.createTestCase ? testModule.createTestCase() : testModule;

        if (test.setUpModule) {
            testsQueue.push(new TestInfo(test.setUpModule, test));
        }

        for (var testName in test) {
            var testFunction = test[testName];
            if ((typeof (testFunction) === "function") && (testName.substring(0, 4) == "test")) {
                if (test.setUp) {
                    testsQueue.push(new TestInfo(test.setUp, test));
                }
                var testTimeout = testsWithLongDelay[testName];
                testsQueue.push(new TestInfo(testFunction, test, true, name + "." + testName, false, null, testTimeout));
                if (test.tearDown) {
                    testsQueue.push(new TestInfo(test.tearDown, test));
                }
            }
        }
        if (test.tearDownModule) {
            testsQueue.push(new TestInfo(test.tearDownModule, test));
        }
        
        //var moduleEnd = function (moduleName) {
        //    return function () {
        //        TKUnit.write("--- " + moduleName + " TESTS COMPLETE --- ", trace.messageType.info);
        //    };
        //}
        //testsQueue.push(new TestInfo(moduleEnd(name)));
    }

    testsQueue.push(new TestInfo(printRunTestStats));
    testsQueue.push(new TestInfo(function () { testsQueue = []; running = false; }));

    TKUnit.runTests(testsQueue, 0);
}



class TestInfo implements TKUnit.TestInfoEntry {
    testFunc: () => void;
    instance: any;
    isTest: boolean;
    testName: string;
    isPassed: boolean;
    errorMessage: string;
    testTimeout: number;

    constructor(testFunc, testInstance?: any, isTest?, testName?, isPassed?, errorMessage?, testTimeout?) {
        this.testFunc = testFunc;
        this.instance = testInstance || null;
        this.isTest = isTest || false;
        this.testName = testName || "";
        this.isPassed = isPassed || false;
        this.errorMessage = errorMessage || "";
        this.testTimeout = testTimeout;
    }
}
