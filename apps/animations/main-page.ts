import observable = require("data/observable");
import pages = require("ui/page");
import buttonModule = require("ui/button");
import abs = require("ui/layouts/absolute-layout");
import animationModule = require("ui/animation");
import colorModule = require("color");
import model = require("./model");

var vm = new model.ViewModel();

var page: pages.Page;
var panel: abs.AbsoluteLayout;
var button1: buttonModule.Button;
var button2: buttonModule.Button;
var button3: buttonModule.Button;
var buttonAnimation: animationModule.Animation;
var panelAnimation: animationModule.Animation;

export function pageLoaded(args: observable.EventData) {
    page = <pages.Page>args.object;
    page.bindingContext = vm;
    panel = page.getViewById<abs.AbsoluteLayout>("panel1");
    button1 = page.getViewById<buttonModule.Button>("button1");
    button2 = page.getViewById<buttonModule.Button>("button2");
    button3 = page.getViewById<buttonModule.Button>("button3");
}

export function onSlideOut(args: observable.EventData) {
    console.log("onSlideOut");
    var curve = page.android ? new android.view.animation.AccelerateInterpolator(1) : UIViewAnimationCurve.UIViewAnimationCurveEaseIn;

    var buttonAnimations = [
        { target: button1, translate: { x: -240, y: 0 }, scale: { x: 0.5, y: 0.5 }, opacity: 0, duration: vm.duration, delay: 0, iterations: vm.iterations, curve: curve },
        { target: button2, translate: { x: -240, y: 0 }, scale: { x: 0.5, y: 0.5 }, opacity: 0, duration: vm.duration, delay: vm.duration, iterations: vm.iterations, curve: curve },
        { target: button3, translate: { x: -240, y: 0 }, scale: { x: 0.5, y: 0.5 }, opacity: 0, duration: vm.duration, delay: vm.duration * 2, iterations: vm.iterations, curve: curve },
    ]
    buttonAnimation = new animationModule.Animation(buttonAnimations, vm.playSequentially);

    panelAnimation = panel.createAnimation({ opacity: 0, scale: { x: 0.5, y: 0.5 }, rotate: -360, backgroundColor: new colorModule.Color("red"), duration: vm.duration, iterations: vm.iterations });

    buttonAnimation.play()
        .then(() => panelAnimation.play())
        .catch((e) => console.log(e.message));
}

export function onSlideIn(args: observable.EventData) {
    console.log("onSlideIn");
    var curve = page.android ? new android.view.animation.DecelerateInterpolator(1) : UIViewAnimationCurve.UIViewAnimationCurveEaseOut;

    panelAnimation = panel.createAnimation({ opacity: 1, scale: { x: 1, y: 1 }, rotate: 0, backgroundColor: new colorModule.Color("yellow"), duration: vm.duration, iterations: vm.iterations });

    var buttonAnimations = [
        { target: button3, translate: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, opacity: 1, duration: vm.duration, delay: 0, iterations: vm.iterations, curve: curve },
        { target: button2, translate: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, opacity: 1, duration: vm.duration, delay: vm.duration, iterations: vm.iterations, curve: curve },
        { target: button1, translate: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, opacity: 1, duration: vm.duration, delay: vm.duration * 2, iterations: vm.iterations, curve: curve },
    ]
    buttonAnimation = new animationModule.Animation(buttonAnimations, vm.playSequentially);

    panelAnimation.play()
        .then(() => buttonAnimation.play())
        .catch((e) => console.log(e.message));
}

export function onCancel(args: observable.EventData) {
    console.log("onCancel");
    if (panelAnimation.isPlaying) {
        panelAnimation.cancel();
    }
    if (buttonAnimation.isPlaying) {
        buttonAnimation.cancel();
    }
}

export function onTap(args: observable.EventData) {
    console.log((<any>args.object).text);
}

export function onSingle(args: observable.EventData) {
    console.log("onSingle");
    button1.animate({
        opacity: 0.75,
        backgroundColor: new colorModule.Color("Red"),
        translate: { x: 100, y: 100 },
        scale: { x: 2, y: 2 },
        rotate: 180,
        duration: vm.duration,
        delay: 0,
        iterations: vm.iterations,
        curve: button1.ios ? UIViewAnimationCurve.UIViewAnimationCurveEaseIn : new android.view.animation.AccelerateInterpolator(1),
    })
        .then(() => console.log("Animation finished"))
        .catch((e) => console.log(e.message));
}

export function onSequence(args: observable.EventData) {
    console.log("onSequence");
    
    button3.animate({
        translate: { x: 80, y: -40 },
        scale: { x: 0.9, y: 0.3 },
        rotate: 25,
        duration: 1000
    })
    .then(() => button3.animate({
        translate: { x: 0, y: -80 },
        scale: { x: 0.5, y: 0.5 },
        rotate: -25,
        duration: 1000
    }))
    .then(() => button3.animate({
        translate: { x: -80, y: -40 },
        scale: { x: 0.5, y: 0.9 },
        rotate: 45,
        duration: 1000
    }))
    .then(() => button3.animate({
        translate: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotate: 0,
        duration: 1000
    }))
    .then(() => console.log("Animation finished"))
    .catch((e) => console.log(e.message));
}

export function onInterrupted(args: observable.EventData) {
    console.log("onInterrupt");
    
    setTimeout(() => {
        button3.animate({
            translate: { x: 80, y: -40 },
            scale: { x: 0.9, y: 0.3 },
            rotate: 25,
            duration: 1000
        });    
    }, 700 * 0);
    
    setTimeout(function() {
        button3.animate({
            translate: { x: 0, y: -80 },
            scale: { x: 0.5, y: 0.5 },
            rotate: -25,
            duration: 1000
        })
    }, 700 * 1);
    
    setTimeout(function() {
        button3.animate({
            translate: { x: -80, y: -40 },
            scale: { x: 0.5, y: 0.9 },
            rotate: 45,
            duration: 1000
        })
    }, 700 * 2);
    
    setTimeout(function() {
        button3.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            rotate: 0,
            duration: 1000
        })
    }, 700 * 3);
}