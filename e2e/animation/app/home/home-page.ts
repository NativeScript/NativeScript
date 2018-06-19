import { EventData, NavigatedData } from "tns-core-modules/ui/page";
import { AnimationDefinition, Animation } from "tns-core-modules/ui/animation";

let page;
let label1;
let label2;

export function onNavigatedTo(args: NavigatedData) {
    page = args.object;
    label1 = page.getViewById("Label1");
    label2 = page.getViewById("Label2");
}

export function onPlaySequentially(args: EventData) {
    const definitions = new Array<AnimationDefinition>();
    definitions.push({ target: label1, translate: { x: 100, y: 0 }, duration: 500 });
    definitions.push({ target: label1, opacity: 0.1, duration: 500 });

    const animationSet = new Animation(definitions, true);
    animationSet.play()
    .then(() => {
        label1.text = "Label1 animated sequentially!";
    });
}

export function onPlaySimultaneously(args: EventData) {
    const definitions = new Array<AnimationDefinition>();
    definitions.push({ target: label2, translate: { x: 0, y: 100 }, duration: 500 });
    definitions.push({ target: label2, opacity: 0.1, duration: 500 });

    const animationSet = new Animation(definitions, true);
    animationSet.play()
    .then(() => {
        label2.text = "Label2 animated simultaneously!";
    });
}
