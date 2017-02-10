import * as TKUnit from "../TKUnit";
import * as helper from "../ui/helper";
import * as platform from "platform";
import * as trace from "trace";
import { Color } from "color";
import { NavigationEntry, NavigationTransition, topmost as topmostFrame, traceEnabled } from "ui/frame";
import { Page } from "ui/page";
import { AnimationCurve } from "ui/enums"

function _testTransition(navigationTransition: NavigationTransition) {
    var testId = `Transition[${JSON.stringify(navigationTransition)}]`;
    if (traceEnabled()) {
        trace.write(`Testing ${testId}`, trace.categories.Test);
    }
    var navigationEntry: NavigationEntry = {
        create: function (): Page {
            let page = new Page();
            page.id = testId;
            page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
            return page;
        },
        animated: true,
        transition: navigationTransition
    }

    helper.navigateWithEntry(navigationEntry);
    TKUnit.wait(0.100);
}

// Extremely slow. Run only if needed.
export var test_Transitions = function () {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    helper.navigate(() => {
        var page = new Page();
        page.id = "TransitionsTestPage_MAIN"
        page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return page;
    });

    var transitions;
    var testCustomTransition = true;
    if (platform.device.os === platform.platformNames.ios) {
        transitions = ["curl"];
    }
    else {
        var _sdkVersion = parseInt(platform.device.sdkVersion);
        transitions = _sdkVersion >= 21 ? ["explode"] : [];
        if (_sdkVersion === 23) {
            // Apparently, there is some kind of Android 6.0 (API 23) bug when using ObjectAnimators
            // http://stackoverflow.com/questions/33188485/resultindex-is-1-the-polygon-must-be-invalid-adter-addview
            testCustomTransition = false;
        }
    }
    transitions = transitions.concat(["fade", "flip", "slide"]);
    var durations = [undefined, 10];
    var curves = [undefined, AnimationCurve.easeIn];

    // Built-in transitions
    transitions.forEach(name => {
        durations.forEach(duration => {
            curves.forEach(curve => {
                _testTransition({ name, duration, curve });
            });
        });
    });

    // Custom transition
    if (testCustomTransition) {
        var customTransitionModule = require("./custom-transition");
        var customTransition = new customTransitionModule.CustomTransition();
        _testTransition({ instance: customTransition });
    }

    helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: false });
}
