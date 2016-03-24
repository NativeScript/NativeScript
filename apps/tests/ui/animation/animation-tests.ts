import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import pageModule = require("ui/page");
import viewModule = require("ui/core/view");
import labelModule = require("ui/label");
import stackLayoutModule = require("ui/layouts/stack-layout");
import colorModule = require("color");
import enums = require("ui/enums");

// <snippet module="ui/animation" title="animation">
// # Animation
// Animating view properties requires the "ui/animation" module.
// ``` JavaScript
import animation = require("ui/animation");
// ```
// </snippet>

export var test_AnimatingProperties = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Animating properties
    // ``` JavaScript
    label.animate({
        opacity: 0.75,
        backgroundColor: new colorModule.Color("Red"),
        translate: { x: 100, y: 100 },
        scale: { x: 2, y: 2 },
        rotate: 180,
        duration: 1000,
        delay: 100,
        iterations: 3,
        curve: enums.AnimationCurve.easeIn
    })
        .then(() => {
            ////console.log("Animation finished.");
            // <hide>
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
            // </hide>
        })
        .catch((e) => {
            console.log(e.message);
            // <hide>
            helper.goBack();
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
}

export var test_CancellingAnimation = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Cancelling animation
    // ``` JavaScript
    var animation1 = label.createAnimation({ translate: { x: 100, y: 100 }, duration: 500 });
    animation1.play()
        .then(() => {
            ////console.log("Animation finished");
            // <hide>
            throw new Error("Cancelling Animation - Should not be in the Promise Then()");
            // </hide>
        })
        .catch((e) => {
            ////console.log("Animation cancelled");
            // <hide>
            helper.goBack();
            if (!e) {
                done(new Error("Cancel path did not have proper error"));
            } else if (e.toString() === "Error: Animation cancelled.") {
                done()
            } else {
                done(e);
            }
            // </hide>
        });
    animation1.cancel();
    // ```
    // </snippet>
}

export var test_CancellingAnimate = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Cancelling animation
    // ``` JavaScript
    var animation1 = label.animate({ translate: { x: 100, y: 100 }, duration: 500 })
        .then(() => {
            ////console.log("Animation finished");
            // <hide>
            throw new Error("Cancelling Animate - Should not be in Promise Then()");
            // </hide>
        })
        .catch((e) => {
            ////console.log("Animation cancelled");
            // <hide>
            helper.goBack();
            if (!e) {
                done(new Error("Cancel path did not have proper error"));
            } else if (e.toString() === "Error: Animation cancelled.") {
                done()
            } else {
                done(e);
            }
            // </hide>
        });
    animation1.cancel();
    // ```
    // </snippet>
}

export var test_ChainingAnimations = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };
    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Chaining animations
    // ``` JavaScript
    label.animate({ opacity: 0 })
        .then(() => label.animate({ opacity: 1 }))
        .then(() => label.animate({ translate: { x: 200, y: 200 } }))
        .then(() => label.animate({ translate: { x: 0, y: 0 } }))
        .then(() => label.animate({ scale: { x: 5, y: 5 } }))
        .then(() => label.animate({ scale: { x: 1, y: 1 } }))
        .then(() => label.animate({ rotate: 180 }))
        .then(() => label.animate({ rotate: 0 }))
        .then(() => {
            ////console.log("Animation finished");
            // <hide>
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
            // </hide>
        })
        .catch((e) => {
            console.log(e.message);
            // <hide>
            helper.goBack();
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
}

export var test_ReusingAnimations = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Reusing animations
    // ``` JavaScript
    var animation1 = label.createAnimation({ translate: { x: 100, y: 100 } });
    var animation2 = label.createAnimation({ translate: { x: 0, y: 0 } });

    animation1.play()
        .then(() => animation2.play())
        .then(() => animation1.play())
        .then(() => animation2.play())
        .then(() => animation1.play())
        .then(() => animation2.play())
        .then(() => {
            ////console.log("Animation finished");
            // <hide>
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
            // </hide>
        })
        .catch((e) => {
            console.log(e.message);
            // <hide>
            helper.goBack();
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
}

export var test_AnimatingMultipleViews = function(done) {
    var mainPage: pageModule.Page;
    var label1: labelModule.Label;
    var label2: labelModule.Label;
    var label3: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label1 = new labelModule.Label();
        label1.text = "label1";
        label2 = new labelModule.Label();
        label2.text = "label2";
        label3 = new labelModule.Label();
        label3.text = "label3";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label1);
        stackLayout.addChild(label2);
        stackLayout.addChild(label3);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };
    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label1.isLoaded && label2.isLoaded });

    // <snippet module="ui/animation" title="animation">
    // # Animating multiple views simultaneously
    // ``` JavaScript
    var animations: Array<animation.AnimationDefinition> = [
        { target: label1, translate: { x: 200, y: 200 }, duration: 1000, delay: 0 },
        { target: label2, translate: { x: 200, y: 200 }, duration: 1000, delay: 333 },
        { target: label3, translate: { x: 200, y: 200 }, duration: 1000, delay: 666 },
    ];
    var a = new animation.Animation(animations);
    a.play()
        .then(() => {
            ////console.log("Animations finished");
            // <hide>
            assertIOSNativeTransformIsCorrect(label1);
            assertIOSNativeTransformIsCorrect(label2);
            assertIOSNativeTransformIsCorrect(label3);
            helper.goBack();
            done();
            // </hide>
        })
        .catch((e) => {
            console.log(e.message);
            // <hide>
            helper.goBack();
            done(e);
            // </hide>
        });
    // ```
    // </snippet>
}

export var test_AnimateOpacity = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({ opacity: 0.75 })
        .then(() => {
            TKUnit.assertEqual(label.opacity, 0.75, "label.opacity");
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateOpacity_ShouldThrow_IfNotNumber = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ opacity: <any>"0.75" });
        }, "Setting opacity to a non number should throw.");
    });
}

export var test_AnimateDelay_ShouldThrow_IfNotNumber = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ delay: <any>"1" });
        }, "Setting delay to a non number should throw.");
    });
}

export var test_AnimateDuration_ShouldThrow_IfNotNumber = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ duration: <any>"1" });
        }, "Setting duration to a non number should throw.");
    });
}

export var test_AnimateIterations_ShouldThrow_IfNotNumber = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ iterations: <any>"1" });
        }, "Setting iterations to a non number should throw.");
    });
}

export var test_AnimateRotate_ShouldThrow_IfNotNumber = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ rotate: <any>"1" });
        }, "Setting rotate to a non number should throw.");
    });
}

export var test_AnimateScale_ShouldThrow_IfNotPair = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ scale: <any>"1" });
        }, "Setting scale to a non Pair should throw.");
    });
}

export var test_AnimateTranslate_ShouldThrow_IfNotPair = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ translate: <any>"1" });
        }, "Setting translate to a non Pair should throw.");
    });
}

export var test_AnimateBackgroundColor_ShouldThrow_IfNotValidColorStringOrColor = () => {
    var label = new labelModule.Label();
    helper.buildUIAndRunTest(label, (views: Array<viewModule.View>) => {
        TKUnit.assertThrows(() => {
            label.animate({ backgroundColor: <any>"test" });
        }, "Setting backgroundColor to a not valid color string or Color should throw.");
    });
}

export var test_AnimateBackgroundColor = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });
    var red = new colorModule.Color("Red");

    label.animate({ backgroundColor: red })
        .then(() => {
            TKUnit.assert(label.backgroundColor.equals(red));
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateBackgroundColor_FromString = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });
    
    var expected = "Red";
    var clr = new colorModule.Color(expected);

    label.animate({ backgroundColor: <any>expected })
        .then(() => {
            TKUnit.assert(label.backgroundColor.equals(clr));
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateTranslate = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({ translate: { x: 100, y: 200 } })
        .then(() => {
            TKUnit.assertEqual(label.translateX, 100, "label.translateX");
            TKUnit.assertEqual(label.translateY, 200, "label.translateY");
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateScale = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({ scale: { x: 2, y: 3 } })
        .then(() => {
            TKUnit.assertEqual(label.scaleX, 2, "label.scaleX");
            TKUnit.assertEqual(label.scaleY, 3, "label.scaleY");
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateRotate = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({ rotate: 123 })
        .then(() => {
            TKUnit.assertEqual(label.rotate, 123, "label.rotate");
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateTranslateScaleAndRotateSimultaneously = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({
        translate: { x: 100, y: 200 },
        scale: { x: 2, y: 3 },
        rotate: 123
    })
        .then(() => {
            TKUnit.assertEqual(label.translateX, 100, "label.translateX");
            TKUnit.assertEqual(label.translateY, 200, "label.translateY");
            TKUnit.assertEqual(label.scaleX, 2, "label.scaleX");
            TKUnit.assertEqual(label.scaleY, 3, "label.scaleY");
            TKUnit.assertEqual(label.rotate, 123, "label.rotate");
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimateTranslateScaleAndRotateSequentially = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    label.animate({ translate: { x: 100, y: 200 } })
        .then(() => {
            TKUnit.assertEqual(label.translateX, 100, "label.translateX");
            TKUnit.assertEqual(label.translateY, 200, "label.translateY");
            assertIOSNativeTransformIsCorrect(label);
            return label.animate({ scale: { x: 2, y: 3 } });
        })
        .then(() => {
            TKUnit.assertEqual(label.translateX, 100, "label.translateX");
            TKUnit.assertEqual(label.translateY, 200, "label.translateY");
            TKUnit.assertEqual(label.scaleX, 2, "label.scaleX");
            TKUnit.assertEqual(label.scaleY, 3, "label.scaleY");
            assertIOSNativeTransformIsCorrect(label);
            return label.animate({ rotate: 123 });
        })
        .then(() => {
            TKUnit.assertEqual(label.translateX, 100, "label.translateX");
            TKUnit.assertEqual(label.translateY, 200, "label.translateY");
            TKUnit.assertEqual(label.scaleX, 2, "label.scaleX");
            TKUnit.assertEqual(label.scaleY, 3, "label.scaleY");
            TKUnit.assertEqual(label.rotate, 123, "label.rotate");
            assertIOSNativeTransformIsCorrect(label);
            helper.goBack();
            done();
        })
        .catch((e) => {
            helper.goBack();
            done(e);
        });
}

export var test_AnimationsAreAlwaysPlayed = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    var animation1 = label.createAnimation({ opacity: 0 });
    var animation2 = label.createAnimation({ opacity: 1 });

    animation1.play()
        .then(() => {
            TKUnit.assert(label.opacity === 0, `Label opacity should be 0 after first animation, actual value is ${label.opacity}.`);
            return animation2.play()
        })
        .then(() => {
            TKUnit.assert(label.opacity === 1, `Label opacity should be 1 after second animation, actual value is ${label.opacity}.`);
            helper.goBack();
            done();
        })
        .catch((e) => {
            console.log(e.message);
            helper.goBack();
            done(e);
        });
}

export var test_PlayPromiseIsResolvedWhenAnimationFinishes = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    var animation = label.createAnimation({ opacity: 0, duration: 1000 });

    animation.play()
        .then(function onResolved() {
            TKUnit.assert(animation.isPlaying === false, "Animation.isPlaying should be false when animation play promise is resolved.");
            helper.goBack();
            done();
        }, function onRejected(e) {
            TKUnit.assert(1 === 2, "Animation play promise should be resolved, not rejected.");
            helper.goBack();
            done(e);
        });
}

export var test_PlayPromiseIsRejectedWhenAnimationIsCancelled = function(done) {
    var mainPage: pageModule.Page;
    var label: labelModule.Label;
    var pageFactory = function(): pageModule.Page {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackLayoutModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.content = stackLayout;
        return mainPage;
    };

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return label.isLoaded });

    var animation = label.createAnimation({ opacity: 0, duration: 1000 });

    animation.play()
        .then(function onResolved() {
            TKUnit.assert(1 === 2, "Animation play promise should be rejected, not resolved.");
            helper.goBack();
            done();
        }, function onRejected(e) {
            TKUnit.assert(animation.isPlaying === false, "Animation.isPlaying should be false when animation play promise is rejected.");
            helper.goBack();
            done();
        });

    animation.cancel();
}

function assertIOSNativeTransformIsCorrect(view: viewModule.View) {
    if (view.ios) {
        var errorMessage = (<any>animation)._getTransformMismatchErrorMessage(view);
        if (errorMessage) {
            TKUnit.assert(false, errorMessage);
        }
    }
}