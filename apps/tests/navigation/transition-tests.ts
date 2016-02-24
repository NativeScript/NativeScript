import * as TKUnit from "../TKUnit";
import * as helper from "../ui/helper";
import * as platform from "platform";
import * as trace from "trace";
import {Color} from "color";
import {GC} from "utils/utils";
import {NavigationEntry, NavigationTransition} from "ui/frame";
import {Page} from "ui/page";
import {AnimationCurve} from "ui/enums"

function _testTransition(navigationTransition: NavigationTransition) {
    var testId = `Transition[${JSON.stringify(navigationTransition)}]`;
    trace.write(`Testing ${testId}`, trace.categories.Test);
    var navigationEntry: NavigationEntry = {
        create: function (): Page {
            var page = new Page();
            page.id = testId;
            page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
            return page;
        },
        animated: true,
        transition: navigationTransition
    }

    helper.navigateWithEntry(navigationEntry);
    TKUnit.wait(0.100);
    helper.goBack();
    TKUnit.wait(0.100);
    GC();
}

// Extremely slow. Run only if needed.
export var test_Transitions = function () {
    helper.navigate(() => {
        var page = new Page();
        page.id = "TransitionsTestPage_MAIN"
        page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return page;
    });

    var transitions;
    if (platform.device.os === platform.platformNames.ios) {
        transitions = ["curl"];
    }
    else {
        var _sdkVersion = parseInt(platform.device.sdkVersion);
        transitions = _sdkVersion >= 21 ? ["explode"] : [];
    }
    transitions = transitions.concat(["fade", "flip", "slide"]);
    var durations = [undefined, 500];
    var curves = [undefined, AnimationCurve.easeIn];

    // Built-in transitions
    var t, d, c;
    var tlen = transitions.length;
    var dlen = durations.length;
    var clen = curves.length;
    for (t = 0; t < tlen; t++) {
        for (d = 0; d < dlen; d++) {
            for (c = 0; c < clen; c++) {
                _testTransition({
                    name: transitions[t],
                    duration: durations[d],
                    curve: curves[c]
                });
            }
        }
    }

    // Custom transition
    var customTransitionModule = require("./custom-transition");
    var customTransition = new customTransitionModule.CustomTransition();
    _testTransition({ instance: customTransition });

    helper.goBack();
}
