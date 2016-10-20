/* tslint:disable */
import * as TKUnit from"./TKUnit";
import {messageType} from "trace";
import {topmost, Frame} from "ui/frame";
import {TextView} from "ui/text-view";
import * as platform from "platform";
import "./ui-test";
import fs = require("file-system");

Frame.defaultAnimatedNavigation = false;

export function isRunningOnEmulator(): boolean {
    // This checks are not good enough to be added to modules but keeps unittests green.

    if (platform.device.os === platform.platformNames.android) {
        return android.os.Build.FINGERPRINT.indexOf("generic") > -1 ||
            android.os.Build.HARDWARE.toLowerCase() === "goldfish" ||
            android.os.Build.HARDWARE.toLowerCase() === "donatello" || // VS Emulator
            android.os.Build.PRODUCT.toLocaleLowerCase().indexOf("sdk") > -1 ||
            android.os.Build.PRODUCT.toLocaleLowerCase().indexOf("emulator") > -1; // VS Emulator
    }
    else if (platform.device.os === platform.platformNames.ios) {
        //return platform.device.model === "iPhone Simulator";
        return (__dirname.search("Simulator") > -1);
    }
}

export var allTests = {};
if (!isRunningOnEmulator()) {
    allTests["LOCATION"] = require("./location-tests");
}

allTests["PLATFORM"] = require("./platform-tests");
allTests["FILE SYSTEM"] = require("./file-system-tests");
allTests["HTTP"] = require("./http-tests");
allTests["XHR"] = require("./xhr-tests");
allTests["FETCH"] = require("./fetch-tests");
allTests["APPLICATION SETTINGS"] = require("./application-settings-tests");
allTests["APPLICATION"] = require("./application-tests");
allTests["IMAGE SOURCE"] = require("./image-source-tests");
allTests["OBSERVABLE-ARRAY"] = require("./data/observable-array-tests");
allTests["VIRTUAL-ARRAY"] = require("./data/virtual-array-tests");
allTests["OBSERVABLE"] = require("./data/observable-tests");
allTests["TIMER"] = require("./timer-tests");
allTests["COLOR"] = require("./color-tests");
allTests["DEPENDENCY-OBSERVABLE"] = require("./ui/dependency-observable-tests");
allTests["BINDABLE"] = require("./ui/bindable-tests");
allTests["BINDING-EXPRESSIONS"] = require("./ui/binding-expressions-tests");
allTests["XML-PARSER"] = require("./xml-parser-tests/xml-parser-tests");
allTests["FORMATTEDSTRING"] = require("./text/formatted-string-tests");
allTests["FILE-SYSTEM-ACCESS"] = require("./file-system-access-tests/file-system-access-tests");
allTests["FILE-NAME-RESOLVER"] = require("./file-name-resolver-tests/file-name-resolver-tests");
allTests["WEAK-EVENTS"] = require("./weak-event-listener-tests");
allTests["CONNECTIVITY"] = require("./connectivity-tests");

allTests["PROXY-VIEW-CONTAINER"] = require("./ui/proxy-view-container/proxy-view-container-tests")
allTests["SCROLL-VIEW"] = require("./ui/scroll-view/scroll-view-tests");
allTests["ACTION-BAR"] = require("./ui/action-bar/action-bar-tests");
allTests["XML-DECLARATION"] = require("./xml-declaration/xml-declaration-tests");
allTests["DOCKLAYOUT"] = require("./ui/layouts/dock-layout-tests");
allTests["WRAPLAYOUT"] = require("./ui/layouts/wrap-layout-tests");
allTests["ABSOLUTELAYOUT"] = require("./ui/layouts/absolute-layout-tests");
allTests["GRIDLAYOUT"] = require("./ui/layouts/grid-layout-tests");
allTests["STACKLAYOUT"] = require("./ui/layouts/stack-layout-tests");
allTests["FLEXBOXLAYOUT"] = require("./ui/layouts/flexbox-layout-tests");
allTests["STYLE-PROPERTIES"] = require("./ui/styling/style-properties-tests");
allTests["FRAME"] = require("./ui/frame/frame-tests");
allTests["VIEW"] = require("./ui/view/view-tests");
allTests["STYLE"] = require("./ui/styling/style-tests");
allTests["VISUAL-STATE"] = require("./ui/styling/visual-state-tests");
allTests["VALUE-SOURCE"] = require("./ui/styling/value-source-tests");
allTests["CSS-SELECTOR-PARSER"] = require("./ui/styling/css-selector-parser");
allTests["CSS-SELECTOR"] = require("./ui/styling/css-selector");
allTests["BUTTON"] = require("./ui/button/button-tests");
allTests["BORDER"] = require("./ui/border/border-tests");
allTests["LABEL"] = require("./ui/label/label-tests");
allTests["TAB-VIEW"] = require("./ui/tab-view/tab-view-tests");
allTests["TAB-VIEW-NAVIGATION"] = require("./ui/tab-view/tab-view-navigation-tests");
allTests["IMAGE"] = require("./ui/image/image-tests");
allTests["SLIDER"] = require("./ui/slider/slider-tests");
allTests["SWITCH"] = require("./ui/switch/switch-tests");
allTests["PROGRESS"] = require("./ui/progress/progress-tests");
allTests["PLACEHOLDER"] = require("./ui/placeholder/placeholder-tests");
allTests["PAGE"] = require("./ui/page/page-tests");
allTests["LISTVIEW"] = require("./ui/list-view/list-view-tests");
allTests["ACTIVITY-INDICATOR"] = require("./ui/activity-indicator/activity-indicator-tests");
allTests["TEXT-FIELD"] = require("./ui/text-field/text-field-tests");
allTests["TEXT-VIEW"] = require("./ui/text-view/text-view-tests");
allTests["LIST-PICKER"] = require("./ui/list-picker/list-picker-tests");
allTests["DATE-PICKER"] = require("./ui/date-picker/date-picker-tests");
allTests["TIME-PICKER"] = require("./ui/time-picker/time-picker-tests");
allTests["WEB-VIEW"] = require("./ui/web-view/web-view-tests");
allTests["HTML-VIEW"] = require("./ui/html-view/html-view-tests");
allTests["REPEATER"] = require("./ui/repeater/repeater-tests");
allTests["SEARCH-BAR"] = require('./ui/search-bar/search-bar-tests');
allTests["SEGMENTED-BAR"] = require("./ui/segmented-bar/segmented-bar-tests");
allTests["ANIMATION"] = require("./ui/animation/animation-tests");
allTests["CSS-ANIMATION"] = require("./ui/animation/css-animation-tests");

// Skip transitions on android emulators with API 23
if (!(platform.device.os === platform.platformNames.android && parseInt(platform.device.sdkVersion) === 23 && isRunningOnEmulator())) {
    allTests["TANSITIONS"] = require("./navigation/transition-tests");
}

allTests["NAVIGATION"] = require("./navigation/navigation-tests");

var testsWithLongDelay = {
    test_Transitions: 3 * 60 * 1000,
    testLocation: 10000,
    testLocationOnce: 10000,
    testLocationOnceMaximumAge: 10000,
    //web-view-tests
    testLoadExistingUrl: 10000 * 5,
    testLoadLocalFile: 10000 * 5,
    testLoadInvalidUrl: 10000,
    testLoadUpperCaseSrc: 10000 * 5,
    test_SettingImageSrc: 30 * 1000,
    test_ChainingAnimations: 30 * 1000,
    test_AnimatingProperties: 30 * 1000,
    test_AnimateBackgroundColor_FromString: 10 * 1000
}

var startTime;
var running = false;
var testsQueue = new Array<TestInfo>();

function printRunTestStats() {
    let testFileContent = new Array<string>();
    let testCases = new Array<string>();

    var j;
    var failedTestCount = 0;
    var failedTestInfo = [];

    let allTests = testsQueue.filter(t=> t.isTest);

    testFileContent.push("<testsuites>");

    for (j = 0; j < allTests.length; j++) {
        let testName = allTests[j].testName;
        let duration = (allTests[j].duration / 1000).toFixed(2);
        
        if (!allTests[j].isPassed) {
            failedTestCount++;

            let errorMessage = allTests[j].errorMessage;

            failedTestInfo.push(allTests[j].testName + " FAILED: " + allTests[j].errorMessage);

            testCases.push(`<testcase classname="${platform.device.os}" name="${testName}" time="${duration}"><failure type="exceptions.AssertionError"><![CDATA[${errorMessage}]]></failure></testcase>`);

        } else {
            testCases.push(`<testcase classname="${platform.device.os}" name="${testName}" time="${duration}"></testcase>`);
        }
    }
    
    var totalTime = (TKUnit.time() - startTime).toFixed(2);
    
    testFileContent.push(`<testsuite name="NativeScript Tests" timestamp="${new Date()}" hostname="hostname" time="${totalTime}" errors="0" tests="${allTests.length}" skipped="0" failures="${failedTestCount}">`);

    testFileContent = testFileContent.concat(testCases);

    let finalMessage = `\n=== ALL TESTS COMPLETE ===\n` +
        `${(allTests.length - failedTestCount)} OK, ${failedTestCount} failed\n` + 
        `DURATION: ${totalTime} ms\n`;
    TKUnit.write(finalMessage, messageType.info);  

    for (j = 0; j < failedTestInfo.length; j++) {
        let failureMessage = failedTestInfo[j];
        TKUnit.write(failureMessage, messageType.error);
        finalMessage += "\n" + failureMessage;
    }

    // DO NOT CHANGE THE FIRST ROW! Used as an indicator for test run pass detection.
    TKUnit.write(`Tests EOF!`, messageType.info);

    testFileContent.push("</testsuite>");
    testFileContent.push("</testsuites>");

    let testFilePath = fs.path.join(fs.knownFolders.documents().path, "test-results.xml");
    let testFile = fs.File.fromPath(testFilePath);
    testFile.writeTextSync(testFileContent.join(""));

    finalMessage += "\n" + "Test results: " + testFilePath;

    let messageContainer = new TextView();
    messageContainer.text = finalMessage;
    topmost().currentPage.content = messageContainer;
}

function startLog(): void {
    let testsName: string = this.name;
    TKUnit.write("START " + testsName + " TESTS.", messageType.info);
    this.start = TKUnit.time();
}

function log(): void {
    let testsName: string = this.name;
    let duration = TKUnit.time() - this.start;
    TKUnit.write(testsName + " COMPLETED for " + duration + " BACKSTACK DEPTH: " + topmost().backStack.length, messageType.info);
}

export var runAll = function (testSelector?: string) {
    if (running) {
        // TODO: We may schedule pending run requests
        return;
    }

    var singleModuleName, singleTestName;
    if (testSelector) {
        var pair = testSelector.split(".");
        singleModuleName = pair[0];
        if (singleModuleName) {
            if (singleModuleName.length === 0) {
                singleModuleName = undefined;
            } else {
                singleModuleName = singleModuleName.toLowerCase();
            }
        }

        singleTestName = pair[1];
        if (singleTestName) {
            if (singleTestName.length === 0) {
                singleTestName = undefined;
            } else {
                singleTestName = singleTestName.toLowerCase();
            }
        }
    }

    console.log("TESTS: " + singleModuleName + " " + singleTestName);

    var totalSuccess = 0;
    var totalFailed: Array<TKUnit.TestFailure> = [];
    testsQueue.push(new TestInfo(() => { running = true; startTime = TKUnit.time(); }));
    for (var name in allTests) {
        if (singleModuleName && (singleModuleName !== name.toLowerCase())) {
            continue;
        }

        var testModule = allTests[name];

        var test = testModule.createTestCase ? testModule.createTestCase() : testModule;
        test.name = name;


        testsQueue.push(new TestInfo(startLog, test));

        if (test.setUpModule) {
            testsQueue.push(new TestInfo(test.setUpModule, test));
        }

        for (var testName in test) {
            if (singleTestName && (singleTestName !== testName.toLowerCase())) {
                continue;
            }

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
        testsQueue.push(new TestInfo(log, test));
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
    duration: number;

    constructor(testFunc, testInstance?: any, isTest?, testName?, isPassed?, errorMessage?, testTimeout?, duration?) {
        this.testFunc = testFunc;
        this.instance = testInstance || null;
        this.isTest = isTest || false;
        this.testName = testName || "";
        this.isPassed = isPassed || false;
        this.errorMessage = errorMessage || "";
        this.testTimeout = testTimeout;
        this.duration = duration;
    }
}
