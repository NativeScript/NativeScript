import observable = require("data/observable");
import pages = require("ui/page");
import buttonModule = require("ui/button");
import abs = require("ui/layouts/absolute-layout");
import animation = require("ui/animation");
import colorModule = require("color");
import model = require("./model");

var vm = new model.ViewModel();

var page: pages.Page;
var panel1: abs.AbsoluteLayout;
var button1: buttonModule.Button;
var button2: buttonModule.Button;
var button3: buttonModule.Button;
var cancelToken: any;

export function pageLoaded(args: observable.EventData) {
    page = <pages.Page>args.object;
    page.bindingContext = vm;
    panel1 = page.getViewById<abs.AbsoluteLayout>("panel1");
    button1 = page.getViewById<buttonModule.Button>("button1");
    button2 = page.getViewById<buttonModule.Button>("button2");
    button3 = page.getViewById<buttonModule.Button>("button3");
}

export function onSlideOut(args: observable.EventData) {
    var animations: Array<animation.Animation>;

    animations = new Array<animation.Animation>();
    animations.push({ target: button1, property: animation.Properties.translate, value: { x: -240, y: 0 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
    animations.push({ target: button1, property: animation.Properties.scale, value: { x: 0.5, y: 0.5 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
    animations.push({ target: button1, property: animation.Properties.opacity, value: 0, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });

    animations.push({ target: button2, property: animation.Properties.translate, value: { x: -240, y: 0 }, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });
    animations.push({ target: button2, property: animation.Properties.scale, value: { x: 0.5, y: 0.5 }, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });
    animations.push({ target: button2, property: animation.Properties.opacity, value: 0, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });

    animations.push({ target: button3, property: animation.Properties.translate, value: { x: -240, y: 0 }, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });
    animations.push({ target: button3, property: animation.Properties.scale, value: { x: 0, y: 0 }, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });
    animations.push({ target: button3, property: animation.Properties.opacity, value: 0, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });

    configureAnimationCurve(animations, true);

    cancelToken = animation.start(animations, vm.playSequentially, (cancelled?: boolean) => {
        if (cancelled) {
            console.log("Buttons slide out animations cancelled");
            return;
        }
        console.log("Buttons slide out animations completed!");

        animations = new Array<animation.Animation>();
        animations.push({ target: panel1, property: animation.Properties.scale, value: { x: 0, y: 0 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
        animations.push({ target: panel1, property: animation.Properties.rotate, value: 1080, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount  });
        animations.push({ target: panel1, property: animation.Properties.backgroundColor, value: new colorModule.Color("red"), duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
        configureAnimationCurve(animations, true);

        cancelToken = animation.start(animations, vm.playSequentially,(cancelled?: boolean) => {
            if (cancelled) {
                console.log("Panel animation cancelled");
                return;
            }
            console.log("Panel animation completed!");
        });
    });
}

export function onSlideIn(args: observable.EventData) {
    var animations: Array<animation.Animation>;

    animations = new Array<animation.Animation>();
    animations.push({ target: panel1, property: animation.Properties.scale, value: { x: 1, y: 1 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
    animations.push({ target: panel1, property: animation.Properties.rotate, value: 0, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
    animations.push({ target: panel1, property: animation.Properties.backgroundColor, value: new colorModule.Color("yellow"), duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
    configureAnimationCurve(animations, false);

    cancelToken = animation.start(animations, vm.playSequentially,(cancelled?: boolean) => {
        if (cancelled) {
            console.log("Panel animation cancelled");
            return;
        }
        console.log("Panel animation completed!");

        animations = new Array<animation.Animation>();
        animations.push({ target: button1, property: animation.Properties.translate, value: { x: 0, y: 0 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
        animations.push({ target: button1, property: animation.Properties.scale, value: { x: 1, y: 1 }, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });
        animations.push({ target: button1, property: animation.Properties.opacity, value: 1, duration: vm.duration, delay: 0, repeatCount: vm.repeatCount });

        animations.push({ target: button2, property: animation.Properties.translate, value: { x: 0, y: 0 }, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });
        animations.push({ target: button2, property: animation.Properties.scale, value: { x: 1, y: 1 }, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });
        animations.push({ target: button2, property: animation.Properties.opacity, value: 1, duration: vm.duration, delay: vm.duration, repeatCount: vm.repeatCount });

        animations.push({ target: button3, property: animation.Properties.translate, value: { x: 0, y: 0 }, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });
        animations.push({ target: button3, property: animation.Properties.scale, value: { x: 1, y: 1 }, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });
        animations.push({ target: button3, property: animation.Properties.opacity, value: 1, duration: vm.duration, delay: vm.duration * 2, repeatCount: vm.repeatCount });

        configureAnimationCurve(animations, false);

        cancelToken = animation.start(animations, vm.playSequentially,(cancelled?: boolean) => {
            if (cancelled) {
                console.log("Buttons slide in animations cancelled");
                return;
            }
            console.log("Buttons slide in animations completed!");
        });
    });
}

function configureAnimationCurve(animations: Array<animation.Animation>, slideOut: boolean) {
    var i = 0;
    var length = animations.length;
    if (page.android) {
        var interpolator = slideOut ? new android.view.animation.AccelerateInterpolator(1) : new android.view.animation.DecelerateInterpolator(1);
        for (; i < length; i++) {
            animations[i].androidInterpolator = interpolator;
        }
    }
    else {
        for (; i < length; i++) {
            animations[i].iosUIViewAnimationCurve = slideOut ? UIViewAnimationCurve.UIViewAnimationCurveEaseIn : UIViewAnimationCurve.UIViewAnimationCurveEaseOut;
        }
    }
}

export function onStop(args: observable.EventData) {
    cancelToken.cancel();
}

export function onTap(args: observable.EventData) {
    console.log((<any>args.object).text);
}