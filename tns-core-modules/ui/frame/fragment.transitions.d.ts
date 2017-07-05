/**
 * @module "ui/transition"
 */ /** */

import { NavigationTransition } from "../frame";

//@private
/**
 * Waits for animation/transition end on the given fragments.
 * @param newFragment 
 * @param currentFragment 
 */
export function _waitForAnimationEnd(newFragment, currentFragment): void;
/**
 * @private
 */
export function _setAndroidFragmentTransitions(
    animated: boolean,
    navigationTransition: NavigationTransition,
    currentFragment: any,
    newFragment: any,
    fragmentTransaction: any,
    manager: any /* android.app.FragmentManager */): void;
/**
 * @private
 */
export function _onFragmentCreateAnimator(fragment: any, nextAnim: number): any;
/**
 * @private
 */
export function _createIOSAnimatedTransitioning(navigationTransition: NavigationTransition, nativeCurve: any, operation: number, fromVC: any, toVC: any): any;
//@endprivate