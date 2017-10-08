import * as view from 'tns-core-modules/ui/core/view';
import {View} from 'tns-core-modules/ui/core/view';
import * as pages from 'tns-core-modules/ui/page';
import {Button} from 'tns-core-modules/ui/button';
import {SegmentedBar, SegmentedBarItem} from 'tns-core-modules/ui/segmented-bar';
import {Label} from 'tns-core-modules/ui/label';
import {Animation, AnimationDefinition} from 'tns-core-modules/ui/animation';
import * as fpsMeter from 'tns-core-modules/fps-meter';

let fpsCallbackId;
export function onLoaded(args) {
    const page = args.object;
    const fpsLabel = view.getViewById(page, 'fps') as Label;
    fpsCallbackId = fpsMeter.addCallback((fps: number, minFps: number) => {
        fpsLabel.text = `${fps.toFixed(2)}/${minFps.toFixed(2)}`;
    });
    fpsMeter.start();
}

export function onUnloaded() {
    fpsMeter.removeCallback(fpsCallbackId);
    fpsMeter.stop();
}

export function getBoxPropertyAnimationData(property: string,
                                            animateEase: string,
                                            target: View,
                                            extentX: number = 128,
                                            extentY: number = 128) {
    let animateKey;
    let animateValueTo;
    let animateValueFrom;
    let animateDuration = animateEase === 'spring' ? 800 : 500;
    let animateReturnDelay = animateEase === 'spring' ? 0 : 200;

    // Determine the full animation property name (some are shortened in UI), and the demo to/from values
    switch (property) {
        case 'height':
            target.originX = target.originY = 0.5;
            animateKey = 'height';
            animateValueTo = 0;
            animateValueFrom = extentY;
            break;
        case 'width':
            target.originX = target.originY = 0.5;
            animateKey = 'width';
            animateValueTo = 0;
            animateValueFrom = extentX;
            break;
        case 'opacity':
            animateKey = 'opacity';
            animateValueTo = 0;
            animateValueFrom = 1;
            break;
        case 'color':
            animateKey = 'backgroundColor';
            animateValueTo = 'blue';
            animateValueFrom = 'purple';
            break;
        case 'rotate':
            target.originX = target.originY = 0.5;
            animateKey = 'rotate';
            animateValueTo = 180;
            animateValueFrom = 0;
            break;
        case 'scale':
            target.originX = target.originY = 0.5;
            animateKey = 'scale';
            animateValueTo = {x: 0.1, y: 0.1};
            animateValueFrom = {x: 1, y: 1};
            break;
        default:
            throw new Error(`demo animation for '${property}' is not implemented`);
    }

    return {
        animateEase,
        animateKey,
        animateValueTo,
        animateValueFrom,
        animateReturnDelay,
        animateDuration
    };
}

export function easeAnimate(args) {
    const clicked = args.object as Button;
    const page: pages.Page = clicked.page;
    const select = view.getViewById(page, 'select') as SegmentedBar;
    const item: SegmentedBarItem = select.items[select.selectedIndex];
    const animsIn: AnimationDefinition[] = [];
    const animsOut: AnimationDefinition[] = [];
    for (let i = 0; i < 100; i++) {
        const box = view.getViewById(page, 'el-' + i) as Label;
        const prop = getBoxPropertyAnimationData(item.title, clicked.text, box, 32, 24);
        animsIn.push({
            [prop.animateKey]: prop.animateValueTo,
            delay: 15 * i,
            target: box,
            duration: prop.animateDuration,
            curve: prop.animateEase
        });
        animsOut.push({
            [prop.animateKey]: prop.animateValueFrom,
            target: box,
            delay: prop.animateReturnDelay + (5 * (Math.abs(i - 100))),
            duration: prop.animateDuration,
            curve: prop.animateEase
        });
    }
    new Animation(animsIn, false).play()
        .then(() => new Animation(animsOut, false).play())
        .catch((e) => console.log(e));
}
