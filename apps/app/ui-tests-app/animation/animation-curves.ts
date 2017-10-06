import * as view from 'tns-core-modules/ui/core/view';
import * as pages from 'tns-core-modules/ui/page';
import {Button} from 'tns-core-modules/ui/button';

export function easeAnimate(args) {
    const clicked = args.object as Button;
    const page: pages.Page = clicked.page;
    const target: any = view.getViewById(page, 'target');
    const easeType: string = target.text = clicked.text;
    target.animate({
        height: 256,
        duration: 500,
        curve: easeType
    }).then(() => target.animate({
        delay: 200,
        height: 64,
        duration: 500,
        curve: easeType
    }));
}
