import * as TKUnit from "../TKUnit";
import * as helper from "../ui/helper";
import * as platform from "tns-core-modules/platform";
import * as trace from "tns-core-modules/trace";
import { Color } from "tns-core-modules/color";
import { NavigationEntry, NavigationTransition, topmost as topmostFrame } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";
import { AnimationCurve } from "tns-core-modules/ui/enums"
import { CustomTransition } from "./custom-transition";

function _testTransition(navigationTransition: NavigationTransition) {
    var testId = `Transition[${JSON.stringify(navigationTransition)}]`;
    if (trace.isEnabled()) {
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
}

export function test_Transitions() {
    const topmost = topmostFrame();
    const mainTestPage = topmost.currentPage;
    const mainPageFactory = function (): Page {
        return mainTestPage;
    };

    helper.navigate(() => {
        const page = new Page();
        page.id = "TransitionsTestPage_MAIN"
        page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return page;
    });

    var transitions;
    if (platform.device.os === platform.platformNames.ios) {
        transitions = ["curl"];
    } else {
        const _sdkVersion = parseInt(platform.device.sdkVersion);
        transitions = _sdkVersion >= 21 ? ["explode"] : [];
    }

    transitions = transitions.concat(["fade", "slide"]);

    // Custom transition
    _testTransition({ instance: new CustomTransition(), duration: 10 });

    // Built-in transitions
    transitions.forEach(name => {
        _testTransition({ name, duration: 20, curve: AnimationCurve.easeIn });
    });

    // helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: false });
}