/* tslint:disable */
import * as TKUnit from "./TKUnit";
import { messageType } from "tns-core-modules/trace";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { TextView } from "tns-core-modules/ui/text-view";
import { Button } from "tns-core-modules/ui/button";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import * as platform from "tns-core-modules/platform";
import "./ui-test";
import * as fs from "tns-core-modules/file-system";
import { unsetValue } from "tns-core-modules/ui/core/properties";
import { ad } from "tns-core-modules/utils/utils";

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

export const allTests = {};

import * as domNodeTest from "./debugger/dom-node-tests";
allTests["DOM-NODE"] = domNodeTest;

import * as profilingTests from "./profiling/profiling-tests";
allTests["PROFILING"] = profilingTests;

import * as platformTests from "./platform/platform-tests";
allTests["PLATFORM"] = platformTests;

import * as fsTests from "./file-system/file-system-tests";
allTests["FILE-SYSTEM"] = fsTests;

import * as httpTests from "./http/http-tests";
allTests["HTTP"] = httpTests;

import * as xhrTests from "./xhr/xhr-tests";
allTests["XHR"] = xhrTests;

import * as fetchTests from "./fetch/fetch-tests";
allTests["FETCH"] = fetchTests;

import * as appSettingsTests from "./application-settings/application-settings-tests";
allTests["APPLICATION-SETTINGS"] = appSettingsTests;

import * as applicationTests from "./application/application-tests";
allTests["APPLICATION"] = applicationTests;

import * as imageSourceTests from "./image-source/image-source-tests";
allTests["IMAGE-SOURCE"] = imageSourceTests;

import * as observableArrayTests from "./data/observable-array-tests";
allTests["OBSERVABLE-ARRAY"] = observableArrayTests;

import * as virtualArrayTests from "./data/virtual-array-tests";
allTests["VIRTUAL-ARRAY"] = virtualArrayTests;

import * as observableTests from "./data/observable-tests";
allTests["OBSERVABLE"] = observableTests;

import * as timerTests from "./timer/timer-tests";
allTests["TIMER"] = timerTests;

import * as colorTests from "./color/color-tests";
allTests["COLOR"] = colorTests;

import * as bindableTests from "./ui/core/bindable/bindable-tests";
allTests["BINDABLE"] = bindableTests;

import * as bindintExpressionTests from "./ui/core/bindable/binding-expressions-tests";
allTests["BINDING-EXPRESSIONS"] = bindintExpressionTests;

import * as xmlParserTests from "./xml-parser-tests/xml-parser-tests";
allTests["XML-PARSER"] = xmlParserTests;

import * as formattedStringTests from "./text/formatted-string-tests";
allTests["FORMATTEDSTRING"] = formattedStringTests;

import * as fileSystemAccessTests from "./file-system-access-tests/file-system-access-tests";
allTests["FILE-SYSTEM-ACCESS"] = fileSystemAccessTests;

import * as fileNameResolverTests from "./file-name-resolver-tests/file-name-resolver-tests";
allTests["FILE-NAME-RESOLVER"] = fileNameResolverTests;

import * as weakEventsTests from "./ui/core/weak-event-listener/weak-event-listener-tests";
allTests["WEAK-EVENTS"] = weakEventsTests;

import * as connectivityTests from "./connectivity/connectivity-tests";
allTests["CONNECTIVITY"] = connectivityTests;

import * as proxyViewContainerTests from "./ui/proxy-view-container/proxy-view-container-tests";
allTests["PROXY-VIEW-CONTAINER"] = proxyViewContainerTests;

import * as scrollViewTests from "./ui/scroll-view/scroll-view-tests";
allTests["SCROLL-VIEW"] = scrollViewTests;

import * as actionBarTests from "./ui/action-bar/action-bar-tests";
allTests["ACTION-BAR"] = actionBarTests;

import * as xmlDeclarationTests from "./xml-declaration/xml-declaration-tests";
allTests["XML-DECLARATION"] = xmlDeclarationTests;

import * as dockLayoutTests from "./ui/layouts/dock-layout-tests";
allTests["DOCKLAYOUT"] = dockLayoutTests;

import * as wrapLayoutTests from "./ui/layouts/wrap-layout-tests";
allTests["WRAPLAYOUT"] = wrapLayoutTests;

import * as absoluteLayoutTests from "./ui/layouts/absolute-layout-tests";
allTests["ABSOLUTELAYOUT"] = absoluteLayoutTests;

import * as gridLayoutTests from "./ui/layouts/grid-layout-tests";
allTests["GRIDLAYOUT"] = gridLayoutTests;

import * as stackLayoutTests from "./ui/layouts/stack-layout-tests";
allTests["STACKLAYOUT"] = stackLayoutTests;

import * as flexBoxLayoutTests from "./ui/layouts/flexbox-layout-tests";
allTests["FLEXBOXLAYOUT"] = flexBoxLayoutTests;

import * as stylePropertiesTests from "./ui/styling/style-properties-tests";
allTests["STYLE-PROPERTIES"] = stylePropertiesTests;

import * as frameTests from "./ui/frame/frame-tests";
allTests["FRAME"] = frameTests;

import * as viewTests from "./ui/view/view-tests";
allTests["VIEW"] = viewTests;

import * as styleTests from "./ui/styling/style-tests";
allTests["STYLE"] = styleTests;

import * as visualStateTests from "./ui/styling/visual-state-tests";
allTests["VISUAL-STATE"] = visualStateTests;

import * as valueSourceTests from "./ui/styling/value-source-tests";
allTests["VALUE-SOURCE"] = valueSourceTests;

import * as cssSelectorParserTests from "./ui/styling/css-selector-parser";
allTests["CSS-SELECTOR-PARSER"] = cssSelectorParserTests;

import * as cssSelectorTests from "./ui/styling/css-selector";
allTests["CSS-SELECTOR"] = cssSelectorTests;

import * as buttonTests from "./ui/button/button-tests";
allTests["BUTTON"] = buttonTests;

import * as borderTests from "./ui/border/border-tests";
allTests["BORDER"] = borderTests;

import * as labelTests from "./ui/label/label-tests";
allTests["LABEL"] = labelTests;

import * as tabViewTests from "./ui/tab-view/tab-view-tests";
allTests["TAB-VIEW"] = tabViewTests;

import * as tabViewNavigationTests from "./ui/tab-view/tab-view-navigation-tests";
allTests["TAB-VIEW-NAVIGATION"] = tabViewNavigationTests;

import * as imageTests from "./ui/image/image-tests";
allTests["IMAGE"] = imageTests;

import * as sliderTests from "./ui/slider/slider-tests";
allTests["SLIDER"] = sliderTests;

import * as switchTests from "./ui/switch/switch-tests";
allTests["SWITCH"] = switchTests;

import * as progressTests from "./ui/progress/progress-tests";
allTests["PROGRESS"] = progressTests;

import * as placeholderTests from "./ui/placeholder/placeholder-tests";
allTests["PLACEHOLDER"] = placeholderTests;

import * as pageTests from "./ui/page/page-tests";
allTests["PAGE"] = pageTests;

import * as listViewTests from "./ui/list-view/list-view-tests";
allTests["LISTVIEW"] = listViewTests;

import * as activityIndicatorTests from "./ui/activity-indicator/activity-indicator-tests";
allTests["ACTIVITY-INDICATOR"] = activityIndicatorTests;

import * as textFieldTests from "./ui/text-field/text-field-tests";
allTests["TEXT-FIELD"] = textFieldTests;

import * as textViewTests from "./ui/text-view/text-view-tests";
allTests["TEXT-VIEW"] = textViewTests;

import * as listPickerTests from "./ui/list-picker/list-picker-tests";
allTests["LIST-PICKER"] = listPickerTests;

import * as datePickerTests from "./ui/date-picker/date-picker-tests";
allTests["DATE-PICKER"] = datePickerTests;

import * as timePickerTests from "./ui/time-picker/time-picker-tests";
allTests["TIME-PICKER"] = timePickerTests;

import * as webViewTests from "./ui/web-view/web-view-tests";
allTests["WEB-VIEW"] = webViewTests;

import * as htmlViewTests from "./ui/html-view/html-view-tests";
allTests["HTML-VIEW"] = htmlViewTests;

import * as repeaterTests from "./ui/repeater/repeater-tests";
allTests["REPEATER"] = repeaterTests;

import * as segmentedBarTests from "./ui/segmented-bar/segmented-bar-tests";
allTests["SEGMENTED-BAR"] = segmentedBarTests;

import * as animationTests from "./ui/animation/animation-tests";
allTests["ANIMATION"] = animationTests;

import * as lifecycle from "./ui/lifecycle/lifecycle-tests";
allTests["LIFECYCLE"] = lifecycle;


import * as cssAnimationTests from "./ui/animation/css-animation-tests";
allTests["CSS-ANIMATION"] = cssAnimationTests;

import * as transitionTests from "./navigation/transition-tests";
allTests["TANSITIONS"] = transitionTests;
import * as searchBarTests from "./ui/search-bar/search-bar-tests";
allTests["SEARCH-BAR"] = searchBarTests;

import * as navigationTests from "./navigation/navigation-tests";
allTests["NAVIGATION"] = navigationTests;

const testsWithLongDelay = {
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

let startTime;
let running = false;
let testsQueue = new Array<TestInfo>();

function printRunTestStats() {
    const testCases = new Array<string>();

    let failedTestCount = 0;
    const failedTestInfo = [];
    const slowTests = new Array<string>();

    let allTests = testsQueue.filter(t => t.isTest);

    allTests.forEach((testCase, i, arr) => {
        let testName = testCase.testName;
        if (!testCase.isPassed) {
            failedTestCount++;
            failedTestInfo.push(testCase.testName + " FAILED: " + testCase.errorMessage);
        }

        let duration = (testCase.duration / 1000).toFixed(2);
        if (testCase.duration > 500) {
            slowTests.push(`${testCase.testName}: ${duration}s`);
        }
    });

    const totalTime = (TKUnit.time() - startTime).toFixed(2);

    let finalMessage = `\n` +
        `=== ALL TESTS COMPLETE ===\n` +
        `${(allTests.length - failedTestCount)} OK, ${failedTestCount} failed\n` +
        `DURATION: ${totalTime} ms\n`;

    TKUnit.write(finalMessage, messageType.info);

    failedTestInfo.forEach((message, i, arr) => {
        TKUnit.write(message, messageType.error);
        finalMessage += "\n" + message;
    });

    // console.log("test-result.xml:\n" + generateTestFile(allTests));

    // DO NOT CHANGE THE FIRST ROW! Used as an indicator for test run pass detection.
    TKUnit.write(`Tests EOF!`, messageType.info);

    showReportPage(finalMessage);
}

function generateTestFile(allTests: TestInfo[]) {
    let failedTestCount = 0;

    const testCases = new Array<string>();
    allTests.forEach((testCase, i, arr) => {
        let testName = testCase.testName;
        let duration = (testCase.duration / 1000).toFixed(2);

        testCases.push(`<testcase classname="${platform.device.os}" name="${testName}" time="${duration}">`)
        if (!testCase.isPassed) {
            failedTestCount++;
            testCases.push(`<failure type="exceptions.AssertionError"><![CDATA[${testCase.errorMessage}]]></failure>`)
        }
        testCases.push(`</testcase>`);
    });

    const totalTime = (TKUnit.time() - startTime).toFixed(2);

    const result = [
        "<testsuites>",
        `<testsuite name="NativeScript Tests" timestamp="${new Date()}" hostname="hostname" time="${totalTime}" errors="0" tests="${allTests.length}" skipped="0" failures="${failedTestCount}">`,
        ...testCases,
        "</testsuite>",
        "</testsuites>"
    ].join("");

    return result;
}

function showReportPage(finalMessage: string) {
    const stack = new StackLayout();
    const btn = new Button();
    btn.text = "Rerun tests";
    btn.on("tap", () => runAll(testsSelector));
    stack.addChild(btn);

    const messageContainer = new TextView();
    messageContainer.editable = messageContainer.autocorrect = false;
    messageContainer.text = finalMessage;
    stack.addChild(messageContainer);

    const page = topmost().currentPage;
    page.id = unsetValue;
    page.className = unsetValue;
    page.bindingContext = unsetValue;
    page.style.color = unsetValue;
    page.style.backgroundColor = unsetValue;
    page.content = stack;
    messageContainer.focus();
    page.style.fontSize = 11;
    if (page.android) {
        setTimeout(() => {
            messageContainer.dismissSoftInput();
            (<android.view.View>messageContainer.nativeViewProtected).scrollTo(0, 0);
        });
    }
}


function startLog(): void {
    let testsName: string = this.name;
    TKUnit.write("START " + testsName + " TESTS.", messageType.info);
    this.start = TKUnit.time();
}

function log(): void {
    let testsName: string = this.name;
    let duration = TKUnit.time() - this.start;
    TKUnit.write(testsName + " COMPLETED for " + duration.toFixed(2) + " BACKSTACK DEPTH: " + topmost().backStack.length, messageType.info);
}

let testsSelector: string
export function runAll(testSelector?: string) {
    testsSelector = testSelector;
    if (running) {
        // TODO: We may schedule pending run requests
        return;
    }

    let singleModuleName, singleTestName;
    if (testSelector) {
        const pair = testSelector.split(".");
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

    console.log("TESTS: " + singleModuleName ? singleModuleName : "" + " " + singleTestName ? singleTestName : "");

    const totalSuccess = 0;
    const totalFailed: Array<TKUnit.TestFailure> = [];
    testsQueue.push(new TestInfo(() => { running = true; startTime = TKUnit.time(); }));
    for (const name in allTests) {
        if (singleModuleName && (singleModuleName !== name.toLowerCase())) {
            continue;
        }

        const testModule = allTests[name];

        const test = testModule.createTestCase ? testModule.createTestCase() : testModule;
        test.name = name;

        testsQueue.push(new TestInfo(startLog, test));

        if (test.setUpModule) {
            testsQueue.push(new TestInfo(test.setUpModule, test));
        }

        for (const testName in test) {
            if (singleTestName && (singleTestName !== testName.toLowerCase())) {
                continue;
            }

            const testFunction = test[testName];
            if ((typeof (testFunction) === "function") && (testName.substring(0, 4) == "test")) {
                if (test.setUp) {
                    testsQueue.push(new TestInfo(test.setUp, test));
                }
                const testTimeout = testsWithLongDelay[testName];
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