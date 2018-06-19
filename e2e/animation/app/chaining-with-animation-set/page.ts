import { EventData, Page } from "tns-core-modules/ui/page";
import { Animation, AnimationDefinition } from "tns-core-modules/ui/animation";
import { Label } from "tns-core-modules/ui/label";

let view1: Label;
let view2: Label;
let view3: Label;
let view4: Label;

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    view1 = page.getViewById<Label>("view1");
    view2 = page.getViewById<Label>("view2");
    view3 = page.getViewById<Label>("view3");
    view4 = page.getViewById<Label>("view4");
}

export function onAnimateSequentially(args: EventData) {
    animate(true);
}

export function onAnimateSimultaneously(args: EventData) {
    animate(false);
}

export function onReset(args: EventData) {
    view1.translateX = 0;
    view1.translateY = 0;
    view2.translateX = 0;
    view2.translateY = 0;
    view3.translateX = 0;
    view3.translateY = 0;
    view4.translateX = 0;
    view4.translateY = 0;

    view4.text = "{N4}";
}

function animate(playSequentially: boolean) {
    const definitions = new Array<AnimationDefinition>();
    definitions.push({ target: view1, translate: { x: 200, y: 0 }, duration: 500 });
    definitions.push({ target: view2, translate: { x: 0, y: 200 }, duration: 500 });
    definitions.push({ target: view3, translate: { x: -200, y: 0 }, duration: 500 });
    definitions.push({ target: view4, translate: { x: 0, y: -200 }, duration: 500 });

    const animationSet = new Animation(definitions, playSequentially);
    animationSet.play().then(() => {
        view4.text = "{{N4}}";
        console.log("Animation finished");
    })
    .catch((e) => {
        console.log(e.message);
    });
}
