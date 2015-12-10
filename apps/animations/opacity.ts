import observable = require("data/observable");
import pages = require("ui/page");
import view = require("ui/core/view");
import buttonModule = require("ui/button");
import abs = require("ui/layouts/absolute-layout");
import animationModule = require("ui/animation");
import colorModule = require("color");
import model = require("./model");
import enums = require("ui/enums");
import frame = require("ui/frame");
import slider = require("ui/slider");
import wrapLayout = require("ui/layouts/wrap-layout");

var page: pages.Page;
var opacitySlider: slider.Slider;
var red = new colorModule.Color("red");
var green = new colorModule.Color("green");
var container: wrapLayout.WrapLayout; 

export function pageLoaded(args: observable.EventData) {
    page = <pages.Page>args.object;
    opacitySlider = page.getViewById<slider.Slider>("opacitySlider");
    container = page.getViewById<wrapLayout.WrapLayout>("container");
}

export function onSetOpacity(args: observable.EventData) {
    var newOpacity = opacitySlider.value / 100;
    container._eachChildView((childView: view.View) => {
        childView.opacity = newOpacity;
        return true;
    });
}

var animationSet: animationModule.Animation;
export function onAnimateOpacity(args: observable.EventData) {
    var newOpacity = opacitySlider.value / 100;
    var animationDefinitions = new Array<animationModule.AnimationDefinition>();
    container._eachChildView((childView: view.View) => {
        animationDefinitions.push({
            target: childView,
            opacity: newOpacity,
            duration: 5000
        });
        return true;
    });

    animationSet = new animationModule.Animation(animationDefinitions);
    animationSet.play();
}

export function onReset(args: observable.EventData) {
    animationSet.cancel();
}
