// Definitions for Android API lvl 21 transitions
declare namespace android {
	export namespace transition {
		export abstract class Transition extends java.lang.Object {
			addListener(transition: Transition.TransitionListener): Transition;
			removeListener(transition: Transition.TransitionListener): Transition;
			setDuration(duration: number): Transition;
			setInterpolator(interpolator: android.animation.TimeInterpolator): Transition;
		}

		export abstract class Visibility extends android.transition.Transition {
			constructor();
		}

		export class Slide extends Visibility {
			constructor(slideEdge: number);
		}

		export class Fade extends Visibility {
			constructor(fadingMode: number);
			static IN: number;
			static OUT: number;
		}

		export class Explode extends Visibility {
			constructor();
		}

		export namespace Transition {
			export interface TransitionListener {
				onTransitionStart(transition: android.transition.Transition): void;
				onTransitionEnd(transition: android.transition.Transition): void;
				onTransitionResume(transition: android.transition.Transition): void;
				onTransitionPause(transition: android.transition.Transition): void;
				onTransitionCancel(transition: android.transition.Transition): void;
			}
		}
	}

	export namespace app {
		export interface Fragment {
			getEnterTransition(): android.transition.Transition;
			getExitTransition(): android.transition.Transition;
			getReenterTransition(): android.transition.Transition;
			getReturnTransition(): android.transition.Transition;
			setEnterTransition(transition: android.transition.Transition): void;
			setExitTransition(transition: android.transition.Transition): void;
			setReenterTransition(transition: android.transition.Transition): void;
			setReturnTransition(transition: android.transition.Transition): void;
			setAllowEnterTransitionOverlap(allow: boolean): void;
			setAllowReturnTransitionOverlap(allow: boolean): void;
		}
	}
}
