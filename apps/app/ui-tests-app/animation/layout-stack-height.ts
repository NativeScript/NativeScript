import * as view from 'tns-core-modules/ui/core/view';

export function tapLabel(args) {
    const clicked: view.View = args.object;
    const graffiti = clicked as any;
    clicked.animate({
        height: graffiti.toggle ? 64 : 128,
        duration: 200,
        curve: 'easeOut'
    });
    graffiti.toggle = !graffiti.toggle;
}
