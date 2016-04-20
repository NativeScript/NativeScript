import definition = require("controls-page");
import {View} from "ui/core/view";
import {Page} from "ui/page";
import {topmost as topmostFrame, NavigationTransition, Frame} from "ui/frame";
import {Orientation, AnimationCurve} from "ui/enums";
import {StackLayout} from "ui/layouts/stack-layout";
import {Button} from "ui/button";
import {Label} from "ui/label";
import {TextField} from "ui/text-field";
import {Switch} from "ui/switch";
import {Slider} from "ui/slider";
import {Color} from "color";
import {ScrollView} from "ui/scroll-view";
import * as platform from "platform";

var availableTransitions = ["default", "custom", "flip", "flipRight", "flipLeft", "slide", "slideLeft", "slideRight", "slideTop", "slideBottom", "fade"];
if (platform.device.os === platform.platformNames.ios) {
    availableTransitions = availableTransitions.concat(["curl", "curlUp", "curlDown"]);
}
else {
    availableTransitions = availableTransitions.concat(["explode"]);
}

var availableCurves = [AnimationCurve.easeInOut, AnimationCurve.easeIn, AnimationCurve.easeOut, AnimationCurve.linear];

export interface Context {
    index: number;
    backStackVisible: boolean;
    clearHistory: boolean;
    animated: boolean;
    transition: number;
    curve: number;
    duration: number;
}

export class NavPage extends Page implements definition.ControlsPage {
    constructor(context: Context) {
        super();

        var that = this;
        that.on(View.loadedEvent, (args) => {
            console.log(`${args.object}.loadedEvent`);
            //if (topmostFrame().android) {
            //    topmostFrame().android.cachePagesOnNavigate = true;
            //}
        });
        that.on(View.unloadedEvent, (args) => {
            console.log(`${args.object}.unloadedEvent`);
        });
        that.on(Page.navigatingFromEvent, (args) => {
            console.log(`${args.object}.navigatingFromEvent`);
        });
        that.on(Page.navigatedFromEvent, (args) => {
            console.log(`${args.object}.navigatedFromEvent`);
        });
        that.on(Page.navigatingToEvent, (args) => {
            console.log(`${args.object}.navigatingToEvent`);
        });
        that.on(Page.navigatedToEvent, (args) => {
            console.log(`${args.object}.navigatedToEvent`);
            (<any>topmostFrame())._printFrameBackStack();
            if (topmostFrame().android) {
                (<any>topmostFrame())._printNativeBackStack();
            }
        });

        this.id = "" + context.index;

        var bg = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        this.style.backgroundColor = bg;

        var stackLayout = new StackLayout();
        stackLayout.orientation = Orientation.vertical;

        var goBackButton = new Button();
        goBackButton.text = "<=";
        goBackButton.style.fontSize = 18;
        goBackButton.on(Button.tapEvent, () => {
            topmostFrame().goBack();
        });
        stackLayout.addChild(goBackButton);

        this.on(Page.navigatedToEvent, function () {
            //console.log("Navigated to NavPage " + id + "; backStack.length: " + frameModule.topmost().backStack.length);
            goBackButton.isEnabled = topmostFrame().canGoBack();
        });

        var stateLabel = new Label();
        stateLabel.text = `${this.id} (${(<any>bg)._hex})`;
        stackLayout.addChild(stateLabel);

        var textField = new TextField();
        textField.text = "";
        stackLayout.addChild(textField);

        var changeStateButton = new Button();
        changeStateButton.text = "Click me!"
        var clickCount = 0;
        changeStateButton.on(Button.tapEvent, () => {
            changeStateButton.text = (clickCount++).toString();
        });
        stackLayout.addChild(changeStateButton);

        var optionsLayout = new StackLayout();

        var addToBackStackLabel = new Label();
        addToBackStackLabel.text = "backStackVisible";
        optionsLayout.addChild(addToBackStackLabel);

        var addToBackStackSwitch = new Switch();
        addToBackStackSwitch.checked = context.backStackVisible;
        optionsLayout.addChild(addToBackStackSwitch);

        var clearHistoryLabel = new Label();
        clearHistoryLabel.text = "clearHistory";
        optionsLayout.addChild(clearHistoryLabel);

        var clearHistorySwitch = new Switch();
        clearHistorySwitch.checked = context.clearHistory;
        optionsLayout.addChild(clearHistorySwitch);

        var animatedLabel = new Label();
        animatedLabel.text = "animated";
        optionsLayout.addChild(animatedLabel);

        var animatedSwitch = new Switch();
        animatedSwitch.checked = context.animated;
        optionsLayout.addChild(animatedSwitch);

        var globalTransitionButton = new Button();
        globalTransitionButton.text = "global: " + (Frame.defaultTransition ? Frame.defaultTransition.name : "none");
        globalTransitionButton.on("tap", (args) => {
            Frame.defaultTransition = Frame.defaultTransition ? null : { name: "fade" };
            (<any>args.object).text = "global: " + (Frame.defaultTransition ? Frame.defaultTransition.name : "none");
        });
        optionsLayout.addChild(globalTransitionButton);

        var transitionButton = new Button();
        transitionButton.text = availableTransitions[context.transition];
        transitionButton.on("tap", () => {
            that.showModal("perf-tests/NavigationTest/list-picker-page", { items: availableTransitions, selectedIndex: context.transition }, (selectedIndex: number) => {
                context.transition = selectedIndex;
                transitionButton.text = availableTransitions[context.transition];
            }, true);
        });
        optionsLayout.addChild(transitionButton);

        var curveButton = new Button();
        curveButton.text = availableCurves[context.curve];
        curveButton.on(Button.tapEvent, () => {
            that.showModal("perf-tests/NavigationTest/list-picker-page", { items: availableCurves, selectedIndex: context.curve }, (selectedIndex: number) => {
                context.curve = selectedIndex;
                curveButton.text = availableCurves[context.curve]
            }, true);
        });
        optionsLayout.addChild(curveButton);

        var durationLabel = new Label();
        durationLabel.text = "Duration";
        optionsLayout.addChild(durationLabel);

        var durationSlider = new Slider();
        durationSlider.minValue = 0;
        durationSlider.maxValue = 10000;
        durationSlider.value = context.duration;
        optionsLayout.addChild(durationSlider);

        stackLayout.addChild(optionsLayout);

        var forwardButton = new Button();
        forwardButton.text = "=>";
        forwardButton.style.fontSize = 18;
        forwardButton.on(Button.tapEvent, () => {
            var pageFactory = function () {
                return new NavPage({
                    index: context.index + 1,
                    backStackVisible: addToBackStackSwitch.checked,
                    clearHistory: clearHistorySwitch.checked,
                    animated: animatedSwitch.checked,
                    transition: context.transition,
                    curve: context.curve,
                    duration: durationSlider.value,
                });
            };

            var navigationTransition: NavigationTransition;
            if (context.transition) {// Different from default
                var transitionName = availableTransitions[context.transition];
                var duration = durationSlider.value !== 0 ? durationSlider.value : undefined;
                var curve = context.curve ? availableCurves[context.curve] : undefined;

                if (transitionName === "custom") {
                    var customTransitionModule = require("./custom-transition");
                    var customTransition = new customTransitionModule.CustomTransition(duration, curve);
                    navigationTransition = {
                        instance: customTransition
                    };
                }
                else {
                    navigationTransition = {
                        name: transitionName,
                        duration: duration,
                        curve: curve
                    };
                }
            }

            topmostFrame().navigate({
                create: pageFactory,
                backstackVisible: addToBackStackSwitch.checked,
                clearHistory: clearHistorySwitch.checked,
                animated: animatedSwitch.checked,
                transition: navigationTransition,
            });
        });
        stackLayout.addChild(forwardButton);

        var scrollView = new ScrollView();
        scrollView.content = stackLayout;
        this.content = scrollView;
    }
} 
