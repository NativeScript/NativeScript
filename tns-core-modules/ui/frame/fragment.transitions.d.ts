/**
 * @module "ui/transition"
 */ /** */

import { NavigationTransition, BackstackEntry } from "../frame";

//@private
/**
 * @private
 */
export const enum AnimationType {
    enterFakeResourceId = -10,
    exitFakeResourceId = -20,
    popEnterFakeResourceId = -30,
    popExitFakeResourceId = -40
}

/**
 * @private
 */
export function _setAndroidFragmentTransitions(
    animated: boolean,
    navigationTransition: NavigationTransition,
    currentEntry: BackstackEntry,
    newEntry: BackstackEntry,
    fragmentTransaction: any,
    manager: any /* android.app.FragmentManager */,
    frameId: number): void;
/**
 * @private
 */
export function _onFragmentCreateAnimator(entry: BackstackEntry, fragment: any, nextAnim: number, enter: boolean): any;
/**
 * @private
 */
export function _getAnimatedEntries(frameId: number): Set<BackstackEntry>;
/**
 * @private
 * Called once fragment is recreated after it was destroyed.
 * Reapply animations and transitions from entry to fragment if any.
 */
export function _updateTransitions(entry: BackstackEntry): void;
/**
 * @private
 * Called once fragment is going to reappear from backstack.
 * Reverse transitions from entry to fragment if any.
 */
export function _reverseTransitions(previousEntry: BackstackEntry, currentEntry: BackstackEntry): boolean;
/**
 * @private
 * Called when entry is removed from backstack (either back navigation or
 * navigate with clear history). Removes all animations and transitions from entry
 * and fragment and clears all listeners in order to prevent memory leaks.
 */
export function _clearEntry(entry: BackstackEntry): void;
/**
 * @private
 * Called when fragment is destroyed because activity is destroyed.
 * Removes all animations and transitions but keeps them on the entry
 * in order to reapply them when new fragment is created for the same entry.
 */
export function _clearFragment(entry: BackstackEntry): void;
/**
 * @private
 */
export function _createIOSAnimatedTransitioning(navigationTransition: NavigationTransition, nativeCurve: any, operation: number, fromVC: any, toVC: any): any;
//@endprivate
