import {Label} from 'tns-core-modules/ui/label';

let toggle = false;

export function animateHeight(args) {
    const clicked = args.object as Label;
    clicked
        .animate({
            height: toggle ? 128 : '100%',
            duration: 200,
            curve: 'easeInOut'
        })
        .then(() => {
            clicked.text = toggle ? "Cool." : "Tap here";
        });
    toggle = !toggle;
}
