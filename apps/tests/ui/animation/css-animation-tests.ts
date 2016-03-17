var TKUnit = require("../../TKUnit");
var pageModule = require("ui/page");
var view = require("ui/core/view");
var styleScope = require("ui/styling/style-scope");
var cssSelector = require("ui/styling/css-selector");
var animationModule = require("ui/animation");
var animationGroupModule = require("ui/animation/animationgroup");
var enums = require("ui/enums");
var helper = require("../../ui/helper");
var stackModule = require("ui/layouts/stack-layout");
var labelModule = require("ui/label");
var colorModule = require("color");

function createAnimationFromCSS(css) {
    var scope = new styleScope.StyleScope();
    scope.css = css;
    scope.ensureSelectors();
    var selector = scope._cssSelectors[0];
    var animationGroup = selector.animation;
    return animationGroup;
}

exports.test_ReadAnimationProperties = function() {
    var css = ".test { " +
        "animation-name: first; " +
        "animation-duration: 4s; " +
        "animation-timing-function: ease-in; " +
        "animation-delay: 1.5; " +
        "animation-iteration-count: 10; " +
        "animation-direction: reverse; " +
        "animation-fill-mode: forwards; " +
        " }";
    var animationGroup = createAnimationFromCSS(css);

    TKUnit.assert(animationGroup.name === "first");
    TKUnit.assert(animationGroup.duration === 4000);
    TKUnit.assert(animationGroup.curve === enums.AnimationCurve.easeIn);
    TKUnit.assert(animationGroup.delay === 1500);
    TKUnit.assert(animationGroup.iterations === 10);
    TKUnit.assert(animationGroup.isForwards);
    TKUnit.assert(animationGroup.isReverse);
}

exports.test_ReadTheAnimationProperty = function() {
    var animationGroup = createAnimationFromCSS(".test { animation: second 0.2s ease-out 1 2 }");
    TKUnit.assert(animationGroup.name === "second");
    TKUnit.assert(animationGroup.duration === 200);
    TKUnit.assert(animationGroup.curve === enums.AnimationCurve.easeOut);
    TKUnit.assert(animationGroup.delay === 1000);
    TKUnit.assert(animationGroup.iterations === 2);
}

exports.test_ReadAnimationCurve = function() { // ease-in, ease-out, .. custom
    var animationGroup = createAnimationFromCSS(".test { animation-timing-function: ease-in; }");
    TKUnit.assert(animationGroup.curve == enums.AnimationCurve.easeIn);
    animationGroup = createAnimationFromCSS(".test { animation-timing-function: ease-out; }");
    TKUnit.assert(animationGroup.curve == enums.AnimationCurve.easeOut);
    animationGroup = createAnimationFromCSS(".test { animation-timing-function: linear; }");
    TKUnit.assert(animationGroup.curve == enums.AnimationCurve.linear);
    animationGroup = createAnimationFromCSS(".test { animation-timing-function: ease-in-out; }");
    TKUnit.assert(animationGroup.curve == enums.AnimationCurve.easeInOut);
    animationGroup = createAnimationFromCSS(".test { animation-timing-function: spring; }");
    TKUnit.assert(animationGroup.curve == enums.AnimationCurve.spring);
    animationGroup = createAnimationFromCSS(".test { animation-timing-function: cubic-bezier(0.1, 1.0, 0.5, 0.5); }");
    var curve = animationGroup.curve;
    TKUnit.assert(curve.x1 === 0.1 && curve.y1 === 1.0 && curve.x2 === 0.5 && curve.y2 === 0.5);
}

exports.test_ReadIterations = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-iteration-count: 5; }");
    TKUnit.assert(animationGroup.iterations === 5);
    animationGroup = createAnimationFromCSS(".test { animation-iteration-count: infinite; }");
    TKUnit.assert(animationGroup.iterations === Number.MAX_VALUE);
}

exports.test_ReadFillMode = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-iteration-count: 5; }");
    TKUnit.assert(animationGroup.isForwards === false);
    animationGroup = createAnimationFromCSS(".test { animation-fill-mode: forwards; }");
    TKUnit.assert(animationGroup.isForwards === true);
    animationGroup = createAnimationFromCSS(".test { animation-fill-mode: backwards; }");
    TKUnit.assert(animationGroup.isForwards === false);
}

exports.test_ReadDirection = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-iteration-count: 5; }");
    TKUnit.assert(animationGroup.isReverse === false);
    animationGroup = createAnimationFromCSS(".test { animation-direction: reverse; }");
    TKUnit.assert(animationGroup.isReverse === true);
    animationGroup = createAnimationFromCSS(".test { animation-direction: normal; }");
    TKUnit.assert(animationGroup.isReverse === false);
}

exports.test_ReadKeyframe = function() {
    var scope = new styleScope.StyleScope();
    scope.css = ".test { animation-name: test; } @keyframes test { from { background-color: red; } to { background-color: blue; } }";
    scope.ensureSelectors();
    TKUnit.assert(scope._cssSelectors.length === 1, "CSS selector was not created!");
    var selector = scope._cssSelectors[0];
    TKUnit.assert(selector.isAnimated, "The selector should be animated!");
    var animationGroup = selector.animation;
    TKUnit.assert(animationGroup.name === "test", "Wrong animation name!");
    TKUnit.assert(animationGroup.keyframes.length === 2, "Keyframes not parsed correctly!");
    TKUnit.assert(animationGroup.keyframes[0].duration === 0, "First keyframe duration should be 0");
    TKUnit.assert(animationGroup.keyframes[1].duration === 1, "Second keyframe duration should be 1");
    TKUnit.assert(animationGroup.keyframes[0].declarations.length === 1, "Keyframe declarations are not correct");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "backgroundColor", "Keyframe declarations are not correct");
};

exports.test_ReadScale = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scaleX(5),scaleY(10); } }");
    var scale = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "scale");
    TKUnit.assert(scale.x === 5 && scale.y === 10);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scale(-5, 12.3pt); } }");
    scale = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "scale");
    TKUnit.assert(scale.x === -5 && scale.y === 12.3);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scaleY(10); } }");
    scale = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "scale");
    TKUnit.assert(scale.x === 1 && scale.y === 10);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: scale3d(10, 20, 30); } }");
    scale = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "scale");
    TKUnit.assert(scale.x === 10 && scale.y === 20);
}

exports.test_ReadTranslate = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translateX(5),translateY(10); } }");
    var translate = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "translate");
    TKUnit.assert(translate.x === 5 && translate.y === 10);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translate(-5, 12.3pt); } }");
    translate = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "translate");
    TKUnit.assert(translate.x === -5 && translate.y === 12.3);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translateX(10); } }");
    translate = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "translate");
    TKUnit.assert(translate.x === 10 && translate.y === 0);

    animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: translate3d(10, 20, 30); } }");
    translate = animationGroup.keyframes[0].declarations[0].value;
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "translate");
    TKUnit.assert(translate.x === 10 && translate.y === 20);
}

exports.test_ReadRotate = function() {
    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(5); } }");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "rotate");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].value === 5);

    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(45deg); } }");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "rotate");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].value === 45);

    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: rotate(2rad); } }");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].property === "rotate");
    TKUnit.assert(animationGroup.keyframes[0].declarations[0].value === 2);
}

exports.test_ReadTransform = function() {
    var css = ".test { animation-name: test; } @keyframes test { to { transform: rotate(10),scaleX(5),translate(2,4); } }";
    var animationGroup = createAnimationFromCSS(css);
    var rotate = animationGroup.keyframes[0].declarations[0].value;
    var scale = animationGroup.keyframes[0].declarations[1].value;
    var translate = animationGroup.keyframes[0].declarations[2].value;
    TKUnit.assert(rotate === 10);
    TKUnit.assert(scale.x === 5 && scale.y === 1);
    TKUnit.assert(translate.x === 2 && translate.y === 4);

    var animationGroup = createAnimationFromCSS(".test { animation-name: test; } @keyframes test { to { transform: none; } }");
    var rotate = animationGroup.keyframes[0].declarations[0].value;
    var scale = animationGroup.keyframes[0].declarations[1].value;
    var translate = animationGroup.keyframes[0].declarations[2].value;
    TKUnit.assert(rotate === 0);
    TKUnit.assert(scale.x == 1 && scale.y == 1);
    TKUnit.assert(translate.x === 0 && translate.y === 0);
}

exports.test_ReadAnimationWithUnsortedKeyframes = function() {
    var css = ".test { animation-name: test; } " +
        "@keyframes test { " +
        "from { opacity: 0; } " +
        "20%, 60% { opacity: 0.5; } " +
        "40%, 80% { opacity: 0.3; } " +
        "to { opacity: 1; } " +
        "}";
    var animationGroup = createAnimationFromCSS(css);
    TKUnit.assert(animationGroup.keyframes.length == 6);

    TKUnit.assert(animationGroup.keyframes[0].declarations[0].value === 0);
    TKUnit.assert(animationGroup.keyframes[1].declarations[0].value === 0.5);
    TKUnit.assert(animationGroup.keyframes[2].declarations[0].value === 0.3);
    TKUnit.assert(animationGroup.keyframes[3].declarations[0].value === 0.5);
    TKUnit.assert(animationGroup.keyframes[4].declarations[0].value === 0.3);
    TKUnit.assert(animationGroup.keyframes[5].declarations[0].value === 1);

    TKUnit.assert(animationGroup.keyframes[0].duration === 0);
    TKUnit.assert(animationGroup.keyframes[1].duration === 0.2);
    TKUnit.assert(animationGroup.keyframes[2].duration === 0.4);
    TKUnit.assert(animationGroup.keyframes[3].duration === 0.6);
    TKUnit.assert(animationGroup.keyframes[4].duration === 0.8);
    TKUnit.assert(animationGroup.keyframes[5].duration === 1);
}

exports.test_ReadAnimationsWithCSSImport = function() {
    var css = "@import '~/ui/animation/test.css'; .test { animation-name: test; }";
    var animationGroup = createAnimationFromCSS(css);
    TKUnit.assert(animationGroup.keyframes.length === 3);
    TKUnit.assert(animationGroup.keyframes[1].declarations[0].property === "backgroundColor");
}

exports.test_LoadTwoAnimationsWithTheSameName = function() {
    var scope = new styleScope.StyleScope();
    scope.css = "@keyframes a1 { from { opacity: 0; } to { opacity: 1; } } @keyframes a1 { from { opacity: 0; } to { opacity: 0.5; } } .a { animation-name: a1; }";
    scope.ensureSelectors();
    var selector = scope._cssSelectors[0];
    var animationGroup = selector.animation;
    TKUnit.assert(animationGroup.keyframes.length == 2);
    TKUnit.assert(animationGroup.keyframes[1].declarations[0].value === 0.5);

    scope = new styleScope.StyleScope();
    scope.css = "@keyframes k { from { opacity: 0; } to { opacity: 1; } } .a { animation-name: k; animation-duration: 2; } .a { animation-name: k; animation-duration: 3; }"
    scope.ensureSelectors();
    TKUnit.assert(scope._cssSelectors.length === 2);
    TKUnit.assert(scope._cssSelectors[0].isAnimated === false);
    TKUnit.assert(scope._cssSelectors[1].isAnimated === true);
}

exports.test_LoadAnimationProgrammatically = function() {
    var stack = new stackModule.StackLayout();
    helper.buildUIAndRunTest(stack, function(views) {
        var page = views[1];
        page.css = "@keyframes a { from { opacity: 1; } to { opacity: 0; } }";
        var animationGroup = page.getKeyframesAnimation("a");
        TKUnit.assert(animationGroup.keyframes.length === 2);
        TKUnit.assert(animationGroup.keyframes[1].declarations[0].property === "opacity");
        TKUnit.assert(animationGroup.keyframes[1].declarations[0].value === 0);
    });
}

exports.test_ExecuteCSSAnimation = function() {
    var mainPage;
    var label;
    var pageFactory = function() {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.css = "@keyframes k { from { background-color: red; } to { background-color: green; } } .l { animation-name: k; animation-duration: 0.5s; animation-fill-mode: forwards; }";
        mainPage.content = stackLayout;
        return mainPage;
    };
    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(function() { return label.isLoaded; });
    label.className = "l";
    TKUnit.wait(1);
    TKUnit.assert(new colorModule.Color("green").equals(label.backgroundColor));
}

exports.test_ExecuteFillMode = function() {
    var mainPage;
    var label;
    var pageFactory = function() {
        label = new labelModule.Label();
        label.text = "label";
        var stackLayout = new stackModule.StackLayout();
        stackLayout.addChild(label);
        mainPage = new pageModule.Page();
        mainPage.css = "@keyframes k { from { background-color: red; } to { background-color: green; } } " +
            ".l { animation-name: k; animation-duration: 0.5s; animation-fill-mode: none; } " +
            ".l2 { animation-name: k; animation-duration: 0.5s; animation-fill-mode: forwards; }";
        mainPage.content = stackLayout;
        return mainPage;
    };
    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(function() { return label.isLoaded; });
    TKUnit.assert(label.backgroundColor === undefined);
    label.className = "l";
    TKUnit.wait(1);
    //TKUnit.assert(label.backgroundColor.equals(new colorModule.Color("red")));
    label.className = "l2";
    TKUnit.wait(1);
    //TKUnit.assert(label.backgroundColor.equals(new colorModule.Color("green")));
    
    // should be fixed!
}
