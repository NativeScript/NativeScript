import observable = require("data/observable");
import pages = require("ui/page");
import view = require("ui/core/view");
import animationModule = require("ui/animation");
import slider = require("ui/slider");
import wrapLayout = require("ui/layouts/wrap-layout");

var page: pages.Page;
var opacitySlider: slider.Slider;
var container: wrapLayout.WrapLayout; 

export function pageLoaded(args: observable.EventData) {
    page = <pages.Page>args.object;
    opacitySlider = page.getViewById<slider.Slider>("opacitySlider");
    container = page.getViewById<wrapLayout.WrapLayout>("container");
}

export function onSetOpacity(args: observable.EventData) {
    var newOpacity = opacitySlider.value / 100;
    container.eachChildView((view: view.View) => {
        view.opacity = newOpacity;
        return true;
    });
}

var animationSet: animationModule.Animation;
export function onAnimateOpacity(args: observable.EventData) {
    var newOpacity = opacitySlider.value / 100;
    var animationDefinitions = new Array<animationModule.AnimationDefinition>();
    container.eachChildView((view: view.View) => {
        animationDefinitions.push({
            target: view,
            opacity: newOpacity,
            duration: 5000
        });
        return true;
    });

    animationSet = new animationModule.Animation(animationDefinitions);
    animationSet.play();
}

export function onReset(args: observable.EventData) {
    if (animationSet.isPlaying) {
        animationSet.cancel();
    }
}
