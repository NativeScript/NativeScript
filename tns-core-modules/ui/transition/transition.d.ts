declare module "ui/transition" {
    import { NavigationTransition } from "ui/frame";
    import { Page } from "ui/page";

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

    //@private
    export function _clearBackwardTransitions(fragment: any): void;
    export function _clearForwardTransitions(fragment: any): void;
    export function _setAndroidFragmentTransitions(cachePagesOnNavigate: boolean, navigationTransition: NavigationTransition, currentFragment: any, newFragment: any, fragmentTransaction: any): void;
    export function _onFragmentCreateAnimator(fragment: any, nextAnim: number): any;
    export function _onFragmentShown(fragment: any, isBack: boolean): void;
    export function _onFragmentHidden(fragment: any, isBack: boolean, destroyed: boolean): void;
    export function _removePageNativeViewFromAndroidParent(page: Page): void;
    export function _prepareCurrentFragmentForClearHistory(fragment: any): void;

    export function _createIOSAnimatedTransitioning(navigationTransition: NavigationTransition, nativeCurve: any, operation: number, fromVC: any, toVC: any): any;
    //@endprivate
}