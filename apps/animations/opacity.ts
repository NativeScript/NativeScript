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
    container._eachChildView((view: view.View) => {
        //if (view.android) {
        //    view.android.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        //}
        view.opacity = newOpacity;
        return true;
    });
}

var animationSet: animationModule.Animation;
export function onAnimateOpacity(args: observable.EventData) {
    var newOpacity = opacitySlider.value / 100;
    var animationDefinitions = new Array<animationModule.AnimationDefinition>();
    container._eachChildView((view: view.View) => {
        //if (view.android) {
        //    view.android.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        //}
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
    animationSet.cancel();
}
