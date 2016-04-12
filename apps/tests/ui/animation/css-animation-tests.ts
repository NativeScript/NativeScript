import TKUnit = require("../../TKUnit");
import page = require("ui/page");
import styleScope = require("ui/styling/style-scope");
import keyframeAnimation = require("ui/animation/keyframe-animation");
import enums = require("ui/enums");
import helper = require("../../ui/helper");
import stackModule = require("ui/layouts/stack-layout");
import labelModule = require("ui/label");
import color = require("color");
import selectorModule = require("ui/styling/css-selector");

function createAnimationFromCSS(css: string, name: string): keyframeAnimation.KeyframeAnimationInfo {
    let scope = new styleScope.StyleScope();
    scope.css = css;
    scope.ensureSelectors();
    let selector = findSelectorInScope(scope, name);
    if (selector !== undefined) {
        let animation = selector.animations[0];
        return animation;
    }
    return undefined;
}

function findSelectorInScope(scope: styleScope.StyleScope, name: string): selectorModule.CssSelector {
    let selector = undefined;
    for (let sel of (<any>scope)._mergedCssSelectors) {
        if (sel.expression === name) {
            selector = sel;
            break;
        }
    }
    return selector;
}

exports.test_ReadAnimationProperties = function () {
    let css = ".test { " +
        "animation-name: first; " +
        "animation-duration: 4s; " +
        "animation-timing-function: ease-in; " +
        "animation-delay: 1.5; " +
        "animation-iteration-count: 10; " +
        "animation-direction: reverse; " +
        "animation-fill-mode: forwards; " +
        " }";
    let animation = createAnimationFromCSS(css, "test");
    TKUnit.assertEqual(animation.name, "first");
    TKUnit.assertEqual(animation.duration, 4000);
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.easeIn);
    TKUnit.assertEqual(animation.delay, 1500);
    TKUnit.assertEqual(animation.iterations, 10);
    TKUnit.assertTrue(animation.isForwards);
    TKUnit.assertTrue(animation.isReverse);
};
exports.test_ReadTheAnimationProperty = function () {
    let animation = createAnimationFromCSS(".test { animation: second 0.2s ease-out 1 2 }", "test");
    TKUnit.assertEqual(animation.name, "second");
    TKUnit.assertEqual(animation.duration, 200);
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.easeOut);
    TKUnit.assertEqual(animation.delay, 1000);
    TKUnit.assertEqual(animation.iterations, 2);
};
exports.test_ReadAnimationCurve = function () {
    let animation = createAnimationFromCSS(".test { animation-timing-function: ease-in; }", "test");
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.easeIn);
    animation = createAnimationFromCSS(".test { animation-timing-function: ease-out; }", "test");
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.easeOut);
    animation = createAnimationFromCSS(".test { animation-timing-function: linear; }", "test");
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.linear);
    animation = createAnimationFromCSS(".test { animation-timing-function: ease-in-out; }", "test");
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.easeInOut);
    animation = createAnimationFromCSS(".test { animation-timing-function: spring; }", "test");
    TKUnit.assertEqual(animation.curve, enums.AnimationCurve.spring);
    animation = createAnimationFromCSS(".test { animation-timing-function: cubic-bezier(0.1, 1.0, 0.5, 0.5); }", "test");
    let curve = animation.curve;
    TKUnit.assert(curve.x1 === 0.1 && curve.y1 === 1.0 && curve.x2 === 0.5 && curve.y2 === 0.5);
};
exports.test_ReadIterations = function () {
    let animation = createAnimationFromCSS(".test { animation-iteration-count: 5; }", "test");
    TKUnit.assertEqual(animation.iterations, 5);
    animation = createAnimationFromCSS(".test { animation-iteration-count: infinite; }", "test");
    TKUnit.assertEqual(animation.iterations, Number.MAX_VALUE);
};
exports.test_ReadFillMode = function () {
    let animation = createAnimationFromCSS(".test { animation-iteration-count: 5; }", "test");
    TKUnit.assertFalse(animation.isForwards);
    animation = createAnimationFromCSS(".test { animation-fill-mode: forwards; }", "test");
    TKUnit.assertTrue(animation.isForwards);
    animation = createAnimationFromCSS(".test { animation-fill-mode: backwards; }", "test");
    TKUnit.assertFalse(animation.isForwards);
};
exports.test_ReadDirection = function () {
    let animation = createAnimationFromCSS(".test { animation-iteration-count: 5; }", "test");
    TKUnit.assertFalse(animation.isReverse);
    animation = createAnimationFromCSS(".test { animation-direction: reverse; }", "test");
    TKUnit.assertTrue(animation.isReverse);
    animation = createAnimationFromCSS(".test { animation-direction: normal; }", "test");
    TKUnit.assertFalse(animation.isReverse);
};
exports.test_ReadKeyframe = function () {
    let scope = new styleScope.StyleScope();
    scope.css = ".test { animation-name: test; } @keyframes test { from { background-color: red; } to { background-color: blue; } }";
    scope.ensureSelectors();
    let selector = findSelectorInScope(scope, "test");
    TKUnit.assert(selector !== undefined, "CSS selector was not created!");
    let animation = selector.animations[0];
    TKUnit.assertEqual(animation.name, "test", "Wrong animation name!");
    TKUnit.assertEqual(animation.keyframes.length, 2, "Keyframes not parsed correctly!");
    TKUnit.assertEqual(animation.keyframes[0].duration, 0, "First keyframe duration should be 0");
    TKUnit.assertEqual(animation.keyframes[1].duration, 1, "Second keyframe duration should be 1");
    TKUnit.assertEqual(animation.keyframes[0].declarations.length, 1, "Keyframe declarations are not correct");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "backgroundColor", "Keyframe declarations are not correct");
};
exports.test_ReadScale = function () {
    let animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scaleX(5),scaleY(10); } }", "test");
    let scale = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "scale");
    TKUnit.assert(scale.x === 5 && scale.y === 10);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scale(-5, 12.3pt); } }", "test");
    scale = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "scale");
    TKUnit.assert(scale.x === -5 && scale.y === 12.3);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scaleY(10); } }", "test");
    scale = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "scale");
    TKUnit.assert(scale.x === 1 && scale.y === 10);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scale3d(10, 20, 30); } }", "test");
    scale = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "scale");
    TKUnit.assert(scale.x === 10 && scale.y === 20);
};
exports.test_ReadTranslate = function () {
    let animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translateX(5),translateY(10); } }", "test");
    let translate = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "translate");
    TKUnit.assert(translate.x === 5 && translate.y === 10);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translate(-5, 12.3pt); } }", "test");
    translate = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "translate");
    TKUnit.assert(translate.x === -5 && translate.y === 12.3);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translateX(10); } }", "test");
    translate = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "translate");
    TKUnit.assert(translate.x === 10 && translate.y === 0);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translate3d(10, 20, 30); } }", "test");
    translate = animation.keyframes[0].declarations[0].value;
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "translate");
    TKUnit.assert(translate.x === 10 && translate.y === 20);
};
exports.test_ReadRotate = function () {
    let animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(5); } }", "test");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "rotate");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].value, 5);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(45deg); } }", "test");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "rotate");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].value, 45);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(0.7853981634rad); } }", "test");
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].property, "rotate");
    TKUnit.assertTrue(animation.keyframes[0].declarations[0].value - 45 < 0.1);
};
exports.test_ReadTransform = function () {
    let css = ".test { animation-name: test; } @keyframes test { to { transform: rotate(10),scaleX(5),translate(2,4); } }";
    let animation = createAnimationFromCSS(css, "test");
    let rotate = animation.keyframes[0].declarations[0].value;
    let scale = animation.keyframes[0].declarations[1].value;
    let translate = animation.keyframes[0].declarations[2].value;
    TKUnit.assertEqual(rotate, 10);
    TKUnit.assert(scale.x === 5 && scale.y === 1);
    TKUnit.assert(translate.x === 2 && translate.y === 4);
    animation = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: none; } }", "test");
    rotate = animation.keyframes[0].declarations[0].value;
    scale = animation.keyframes[0].declarations[1].value;
    translate = animation.keyframes[0].declarations[2].value;
    TKUnit.assertEqual(rotate, 0);
    TKUnit.assert(scale.x === 1 && scale.y === 1);
    TKUnit.assert(translate.x === 0 && translate.y === 0);
};
exports.test_ReadAnimationWithUnsortedKeyframes = function () {
    let css = ".test { animation-name: test; } " +
        "@keyframes test { " +
        "from { opacity: 0; } " +
        "20%, 60% { opacity: 0.5; } " +
        "40%, 80% { opacity: 0.3; } " +
        "to { opacity: 1; } " +
        "}";
    let animation = createAnimationFromCSS(css, "test");
    TKUnit.assertEqual(animation.keyframes.length, 6);
    TKUnit.assertEqual(animation.keyframes[0].declarations[0].value, 0);
    TKUnit.assertEqual(animation.keyframes[1].declarations[0].value, 0.5);
    TKUnit.assertEqual(animation.keyframes[2].declarations[0].value, 0.3);
    TKUnit.assertEqual(animation.keyframes[3].declarations[0].value, 0.5);
    TKUnit.assertEqual(animation.keyframes[4].declarations[0].value, 0.3);
    TKUnit.assertEqual(animation.keyframes[5].declarations[0].value, 1);
    TKUnit.assertEqual(animation.keyframes[0].duration, 0);
    TKUnit.assertEqual(animation.keyframes[1].duration, 0.2);
    TKUnit.assertEqual(animation.keyframes[2].duration, 0.4);
    TKUnit.assertEqual(animation.keyframes[3].duration, 0.6);
    TKUnit.assertEqual(animation.keyframes[4].duration, 0.8);
    TKUnit.assertEqual(animation.keyframes[5].duration, 1);
};
exports.test_ReadAnimationsWithCSSImport = function () {
    let css = "@import '~/ui/animation/test.css'; .test { animation-name: test; }";
    let animation = createAnimationFromCSS(css, "test");
    TKUnit.assertEqual(animation.keyframes.length, 3);
    TKUnit.assertEqual(animation.keyframes[1].declarations[0].property, "backgroundColor");
};
exports.test_LoadTwoAnimationsWithTheSameName = function () {
    let scope = new styleScope.StyleScope();
    scope.css = "@keyframes a1 { from { opacity: 0; } to { opacity: 1; } } @keyframes a1 { from { opacity: 0; } to { opacity: 0.5; } } .a { animation-name: a1; }";
    scope.ensureSelectors();
    let selector = findSelectorInScope(scope, "a");
    let animation = selector.animations[0];
    TKUnit.assertEqual(animation.keyframes.length, 2);
    TKUnit.assertEqual(animation.keyframes[1].declarations[0].value, 0.5);
    scope = new styleScope.StyleScope();
    scope.css = "@keyframes k { from { opacity: 0; } to { opacity: 1; } } .a { animation-name: k; animation-duration: 2; } .a { animation-name: k; animation-duration: 3; }";
    scope.ensureSelectors();
    selector = findSelectorInScope(scope, "a");
    TKUnit.assertEqual(selector.animations[0].keyframes.length, 2);
    TKUnit.assertEqual(selector.animations[0].keyframes.length, 2);
};
exports.test_LoadAnimationProgrammatically = function () {
    let stack = new stackModule.StackLayout();
    helper.buildUIAndRunTest(stack, function (views) {
        let page = views[1];
        page.css = "@keyframes a { from { opacity: 1; } to { opacity: 0; } }";
        let animation = page.getKeyframeAnimationWithName("a");
        TKUnit.assertEqual(animation.keyframes.length, 2);
        TKUnit.assertEqual(animation.keyframes[1].declarations[0].property, "opacity");
        TKUnit.assertEqual(animation.keyframes[1].declarations[0].value, 0);
    });
};
exports.test_ExecuteCSSAnimation = function () {
    let mainPage;
    let label;
    let pageFactory = function () {
        label = new labelModule.Label();
        label.text = "label";
        let stackLayout = new stackModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new page.Page();
        mainPage.css = "@keyframes k { from { background-color: red; } to { background-color: green; } } .l { animation-name: k; animation-duration: 0.5s; animation-fill-mode: forwards; }";
        mainPage.content = stackLayout;
        return mainPage;
    };
    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(function () { return label.isLoaded; });
    label.className = "l";
    TKUnit.waitUntilReady(function () { return new color.Color("green").equals(label.backgroundColor); }, 1);
    TKUnit.assert(new color.Color("green").equals(label.backgroundColor));
};
// exports.test_ExecuteFillMode = function () {
//     let mainPage;
//     let label;
//     let pageFactory = function () {
//         label = new labelModule.Label();
//         label.text = "label";
//         let stackLayout = new stackModule.StackLayout();
//         stackLayout.addChild(label);
//         mainPage = new page.Page();
//         mainPage.css = "@keyframes k { from { background-color: red; } to { background-color: green; } } " +
//             ".l { animation-name: k; animation-duration: 0.5s; animation-fill-mode: none; } " +
//             ".l2 { animation-name: k; animation-duration: 0.5s; animation-fill-mode: forwards; }";
//         mainPage.content = stackLayout;
//         return mainPage;
//     };
//     helper.navigate(pageFactory);
//     TKUnit.waitUntilReady(function () { return label.isLoaded; });
//     TKUnit.assertEqual(label.backgroundColor, undefined);
//     label.className = "l";
//     TKUnit.wait(2);
//     TKUnit.assertEqual(label.backgroundColor, undefined);
//     label.className = "l2";
//     TKUnit.waitUntilReady(function() { return new color.Color("green").equals(label.backgroundColor); }, 1);
//     TKUnit.assert(new color.Color("green").equals(label.backgroundColor));
//     helper.goBack();
//     helper.goBack();
// };
exports.test_ReadTwoAnimations = function () {
    let scope = new styleScope.StyleScope();
    scope.css = ".test { animation: one 0.2s ease-out 1 2, two 2s ease-in; }";
    scope.ensureSelectors();
    let selector = findSelectorInScope(scope, "test");
    TKUnit.assertEqual(selector.animations.length, 2);
    TKUnit.assertEqual(selector.animations[0].curve, enums.AnimationCurve.easeOut);
    TKUnit.assertEqual(selector.animations[1].curve, enums.AnimationCurve.easeIn);
    TKUnit.assertEqual(selector.animations[1].name, "two");
    TKUnit.assertEqual(selector.animations[1].duration, 2000);
};
exports.test_AnimationCurveInKeyframes = function () {
    let scope = new styleScope.StyleScope();
    scope.css = "@keyframes an { from { animation-timing-function: linear; background-color: red; } 50% { background-color: green; } to { background-color: black; } } .test { animation-name: an; animation-timing-function: ease-in; }";
    scope.ensureSelectors();
    let selector = findSelectorInScope(scope, "test");
    let animation = selector.animations[0];
    TKUnit.assertEqual(animation.keyframes[0].curve, enums.AnimationCurve.linear);
    TKUnit.assertEqual(animation.keyframes[1].curve, undefined);
    TKUnit.assertEqual(animation.keyframes[1].curve, undefined);
    let realAnimation = keyframeAnimation.KeyframeAnimation.keyframeAnimationFromInfo(animation, 2);
    TKUnit.assertEqual(realAnimation.animations[1].curve, enums.AnimationCurve.linear);
    TKUnit.assertEqual(realAnimation.animations[2].curve, enums.AnimationCurve.easeIn);
};
