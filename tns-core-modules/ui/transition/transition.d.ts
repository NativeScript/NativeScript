/**
 * @module "ui/transition"
 */ /** */

export module AndroidTransitionType {
    export const enter: string;
    export const exit: string;
    export const popEnter: string;
    export const popExit: string;
}

export class Transition {
    constructor(duration: number, nativeCurve: any);
    public getDuration(): number;
    public getCurve(): any;
    public animateIOSTransition(containerView: any, fromView: any, toView: any, operation: any, completion: (finished: boolean) => void): void;
    public createAndroidAnimator(transitionType: string): any;
    public toString(): string;
}
